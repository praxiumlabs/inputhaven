import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'
import { redis } from '../lib/redis.js'
import { analyzeSpam } from '../services/ai.js'
import { processSubmission, generateAutoResponse } from '../services/ai-processor.js'
import { sendWebhook } from '../services/webhook.js'
import { sendEmail } from '../services/email.js'

const app = new Hono()

// ==================== PUBLIC FORM SUBMISSION ====================

app.post('/', async (c) => {
  const startTime = Date.now()
  
  try {
    // Get form data (supports JSON and FormData)
    let body: Record<string, any>
    const contentType = c.req.header('Content-Type') || ''
    
    if (contentType.includes('application/json')) {
      body = await c.req.json()
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await c.req.formData()
      body = Object.fromEntries(formData.entries())
    } else {
      // URL encoded
      const text = await c.req.text()
      body = Object.fromEntries(new URLSearchParams(text))
    }

    // Extract access key
    const accessKey = body.access_key || body.accessKey || body._access_key
    delete body.access_key
    delete body.accessKey
    delete body._access_key

    if (!accessKey) {
      return errorResponse(c, 'MISSING_ACCESS_KEY', 'access_key is required', 400)
    }

    // Get form from cache or database
    const form = await getForm(accessKey)
    if (!form) {
      return errorResponse(c, 'INVALID_FORM', 'Form not found or inactive', 404)
    }

    // Check domain restrictions
    const origin = c.req.header('Origin') || c.req.header('Referer') || ''
    if (form.allowedDomains.length > 0) {
      const allowed = form.allowedDomains.some((domain: string) => origin.includes(domain))
      if (!allowed) {
        return errorResponse(c, 'DOMAIN_NOT_ALLOWED', 'Submissions from this domain are not allowed', 403)
      }
    }

    // Check honeypot
    const honeypotValue = body[form.honeypotField]
    if (honeypotValue) {
      // Silently reject spam but return success (don't let bots know)
      return successResponse(c, form, body, true)
    }
    delete body[form.honeypotField]

    // Check rate limits (IP + monthly)
    const clientIP = getClientIP(c)
    const rateLimitCheck = await checkRateLimits(form, clientIP)
    if (!rateLimitCheck.allowed) {
      return errorResponse(c, 'RATE_LIMITED', rateLimitCheck.message, 429)
    }

    // Remove internal fields
    const internalFields = ['_gotcha', '_redirect', '_next', '_subject', '_replyto', '_cc', '_honeypot']
    internalFields.forEach(field => delete body[field])

    // Build metadata
    const metadata = {
      ip: clientIP,
      userAgent: c.req.header('User-Agent'),
      origin,
      referrer: c.req.header('Referer'),
      country: c.req.header('CF-IPCountry'),
      timestamp: new Date().toISOString(),
      source: 'web'
    }

    // Quick spam check (blocking)
    let spamScore = 0
    if (form.spamThreshold > 0) {
      spamScore = await analyzeSpam(body)
    }
    const isSpam = spamScore >= form.spamThreshold

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        formId: form.id,
        data: body,
        metadata,
        spamScore,
        isSpam
      }
    })

    // Update form stats
    await prisma.form.update({
      where: { id: form.id },
      data: {
        submissionCount: { increment: 1 },
        lastSubmissionAt: new Date()
      }
    })

    // Update user's monthly submission count
    await prisma.user.update({
      where: { id: form.workspace.ownerId },
      data: {
        submissionsThisMonth: { increment: 1 },
        submissionsTotal: { increment: 1 }
      }
    })

    // Invalidate form cache
    await redis.del(`form:${accessKey}`)

    const duration = Date.now() - startTime

    // ==================== BACKGROUND TASKS ====================
    // Fire and forget - don't block response
    
    if (!isSpam) {
      // 🤖 AI Processing (classification, sentiment, summary, entities)
      // This uses the new UFP AI processor with Claude
      if (form.aiEnabled) {
        processSubmission(submission.id, form.id)
          .then(async (aiResults) => {
            console.log(`✨ AI processed submission ${submission.id}:`, {
              classification: aiResults.classification,
              sentiment: aiResults.sentiment,
              processingTime: aiResults.processingTime
            })
            
            // Send auto-response if enabled
            if (form.aiAutoRespond && aiResults) {
              const autoResponse = await generateAutoResponse(submission.id, form.id, aiResults)
              if (autoResponse && body.email) {
                sendEmail({
                  to: body.email,
                  subject: `Re: ${form.name}`,
                  html: autoResponse.replace(/\n/g, '<br>')
                }).catch(console.error)
              }
            }
          })
          .catch(err => console.error('AI processing error:', err))
      }

      // 📧 Send email notifications
      if (form.emailTo.length > 0) {
        sendEmailNotification(form, submission, body).catch(console.error)
      }

      // 🔗 Send webhook
      if (form.webhookUrl) {
        sendWebhook(form, submission, body).catch(console.error)
      }
    }

    return successResponse(c, form, body, isSpam, submission.id, duration)

  } catch (error) {
    console.error('Submission error:', error)
    return errorResponse(c, 'INTERNAL_ERROR', 'An error occurred processing your submission', 500)
  }
})

// ==================== HELPERS ====================

async function getForm(accessKey: string) {
  // Check cache first
  const cacheKey = `form:${accessKey}`
  const cached = await redis.get(cacheKey)
  
  if (cached) {
    return JSON.parse(cached)
  }

  // Fetch from database
  const form = await prisma.form.findUnique({
    where: { accessKey },
    include: {
      workspace: {
        select: {
          id: true,
          ownerId: true,
          owner: {
            select: {
              id: true,
              plan: true,
              submissionsThisMonth: true
            }
          }
        }
      }
    }
  })

  if (!form || !form.isActive || form.isArchived) {
    return null
  }

  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(form))

  return form
}

async function checkRateLimits(form: any, clientIP: string): Promise<{ allowed: boolean; message: string }> {
  // Per-IP rate limit (30 per minute)
  const ipKey = `ratelimit:ip:${form.id}:${clientIP}`
  const ipCount = await redis.incr(ipKey)
  
  if (ipCount === 1) {
    await redis.expire(ipKey, 60)
  }
  
  if (ipCount > 30) {
    return { allowed: false, message: 'Too many submissions from this IP. Please wait.' }
  }

  // Check monthly limits based on plan
  const owner = form.workspace.owner
  const planLimits: Record<string, number> = {
    FREE: 250,
    STARTER: 2500,
    PRO: 25000,
    ENTERPRISE: 1000000
  }
  const limit = planLimits[owner.plan] || 250

  if (owner.submissionsThisMonth >= limit) {
    return { allowed: false, message: 'Monthly submission limit reached.' }
  }

  return { allowed: true, message: '' }
}

function getClientIP(c: any): string {
  return (
    c.req.header('CF-Connecting-IP') ||
    c.req.header('X-Real-IP') ||
    c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  )
}

async function sendEmailNotification(form: any, submission: any, data: any) {
  const subject = `New submission: ${form.name}`
  
  // Build email body
  let body = `<h2>New Form Submission</h2>`
  body += `<p>You received a new submission from <strong>${form.name}</strong></p>`
  body += `<hr>`
  body += `<table style="width:100%;border-collapse:collapse;">`
  
  for (const [key, value] of Object.entries(data)) {
    body += `<tr>`
    body += `<td style="padding:8px;border:1px solid #eee;font-weight:bold;">${key}</td>`
    body += `<td style="padding:8px;border:1px solid #eee;">${value}</td>`
    body += `</tr>`
  }
  
  body += `</table>`
  body += `<hr>`
  body += `<p style="color:#666;font-size:12px;">Submitted at ${new Date().toLocaleString()}</p>`
  body += `<p style="color:#666;font-size:12px;">IP: ${submission.metadata?.ip || 'Unknown'}</p>`

  for (const email of form.emailTo) {
    await sendEmail({
      to: email,
      subject,
      html: body,
      replyTo: data.email || data.Email || undefined
    })
  }
}

function successResponse(c: any, form: any, data: any, isSpam: boolean, submissionId?: string, duration?: number) {
  // Check if it's an AJAX request
  const isAjax = c.req.header('Accept')?.includes('application/json') ||
                 c.req.header('X-Requested-With') === 'XMLHttpRequest'

  if (isAjax) {
    return c.json({
      success: true,
      message: form.successMessage || 'Thank you for your submission!',
      submissionId,
      processingTime: duration ? `${duration}ms` : undefined
    })
  }

  // Redirect for form submissions
  const redirectUrl = form.redirectUrl || `${process.env.APP_URL}/success`
  return c.redirect(redirectUrl, 303)
}

function errorResponse(c: any, code: string, message: string, status: number) {
  const isAjax = c.req.header('Accept')?.includes('application/json') ||
                 c.req.header('X-Requested-With') === 'XMLHttpRequest'

  if (isAjax) {
    return c.json({ success: false, error: { code, message } }, status)
  }

  // For regular form submissions, redirect to error page
  return c.redirect(`${process.env.APP_URL}/error?code=${code}&message=${encodeURIComponent(message)}`, 303)
}

export { app as publicSubmitRoute }
