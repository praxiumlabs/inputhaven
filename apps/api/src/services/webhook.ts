import { prisma } from '../lib/prisma'
import { redis } from '../lib/redis'

interface WebhookPayload {
  event: 'submission.created' | 'submission.updated' | 'submission.spam'
  timestamp: string
  form: {
    id: string
    name: string
  }
  submission: {
    id: string
    data: Record<string, any>
    metadata: Record<string, any>
  }
}

export async function sendWebhook(form: any, submission: any, data: any) {
  if (!form.webhookUrl) return

  const payload: WebhookPayload = {
    event: submission.isSpam ? 'submission.spam' : 'submission.created',
    timestamp: new Date().toISOString(),
    form: {
      id: form.id,
      name: form.name
    },
    submission: {
      id: submission.id,
      data,
      metadata: submission.metadata
    }
  }

  const startTime = Date.now()
  let success = false
  let responseCode: number | undefined
  let responseBody: string | undefined
  let error: string | undefined

  try {
    const response = await fetch(form.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'InputHaven-Webhook/2.0',
        'X-InputHaven-Event': payload.event,
        'X-InputHaven-Signature': await generateSignature(payload, form.accessKey)
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    responseCode = response.status
    responseBody = await response.text().catch(() => '')
    success = response.ok

  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error'
  }

  const duration = Date.now() - startTime

  // Log the webhook
  await prisma.webhookLog.create({
    data: {
      formId: form.id,
      url: form.webhookUrl,
      requestBody: payload,
      responseCode,
      responseBody: responseBody?.slice(0, 1000),
      duration,
      success,
      error
    }
  })

  // Retry failed webhooks
  if (!success) {
    const retryKey = `webhook:retry:${submission.id}`
    const retryCount = await redis.incr(retryKey)
    
    if (retryCount <= 3) {
      await redis.expire(retryKey, 3600)
      // Schedule retry (would be handled by a queue system in production)
      setTimeout(() => sendWebhook(form, submission, data), retryCount * 60000)
    }
  }
}

async function generateSignature(payload: any, secret: string): Promise<string> {
  const crypto = await import('crypto')
  return crypto.createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')
}
