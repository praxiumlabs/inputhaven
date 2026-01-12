import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'

const app = new Hono()

// List webhook logs for a form
app.get('/', async (c) => {
  const user = c.get('user')
  const formId = c.req.query('formId')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')

  if (!formId) {
    return c.json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'formId is required' }
    }, 400)
  }

  // Verify access
  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      workspace: {
        members: {
          some: { userId: user.id }
        }
      }
    }
  })

  if (!form) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Form not found' }
    }, 404)
  }

  const [logs, total] = await Promise.all([
    prisma.webhookLog.findMany({
      where: { formId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.webhookLog.count({ where: { formId } })
  ])

  return c.json({
    success: true,
    data: logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  })
})

// Get single webhook log
app.get('/:id', async (c) => {
  const user = c.get('user')
  const logId = c.req.param('id')

  const log = await prisma.webhookLog.findFirst({
    where: {
      id: logId,
      form: {
        workspace: {
          members: {
            some: { userId: user.id }
          }
        }
      }
    },
    include: {
      form: {
        select: { id: true, name: true }
      }
    }
  })

  if (!log) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Webhook log not found' }
    }, 404)
  }

  return c.json({
    success: true,
    data: log
  })
})

// Retry webhook
app.post('/:id/retry', async (c) => {
  const user = c.get('user')
  const logId = c.req.param('id')

  const log = await prisma.webhookLog.findFirst({
    where: {
      id: logId,
      form: {
        workspace: {
          members: {
            some: { 
              userId: user.id,
              role: { in: ['OWNER', 'ADMIN', 'MEMBER'] }
            }
          }
        }
      }
    },
    include: {
      form: true
    }
  })

  if (!log) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Webhook log not found' }
    }, 404)
  }

  // Retry the webhook
  const startTime = Date.now()
  let success = false
  let responseCode: number | undefined
  let responseBody: string | undefined
  let error: string | undefined

  try {
    const response = await fetch(log.url, {
      method: log.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'InputHaven-Webhook/2.0'
      },
      body: JSON.stringify(log.requestBody),
      signal: AbortSignal.timeout(10000)
    })

    responseCode = response.status
    responseBody = await response.text().catch(() => '')
    success = response.ok
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error'
  }

  const duration = Date.now() - startTime

  // Create new log entry
  const newLog = await prisma.webhookLog.create({
    data: {
      formId: log.formId,
      url: log.url,
      method: log.method,
      requestBody: log.requestBody,
      responseCode,
      responseBody: responseBody?.slice(0, 1000),
      duration,
      success,
      error,
      attempts: log.attempts + 1
    }
  })

  return c.json({
    success: true,
    data: newLog,
    message: success ? 'Webhook retried successfully' : 'Webhook retry failed'
  })
})

// Get webhook stats
app.get('/stats/:formId', async (c) => {
  const user = c.get('user')
  const formId = c.req.param('formId')

  // Verify access
  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      workspace: {
        members: {
          some: { userId: user.id }
        }
      }
    }
  })

  if (!form) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Form not found' }
    }, 404)
  }

  const [total, successful, failed, avgDuration] = await Promise.all([
    prisma.webhookLog.count({ where: { formId } }),
    prisma.webhookLog.count({ where: { formId, success: true } }),
    prisma.webhookLog.count({ where: { formId, success: false } }),
    prisma.webhookLog.aggregate({
      where: { formId },
      _avg: { duration: true }
    })
  ])

  return c.json({
    success: true,
    data: {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total * 100).toFixed(1) : 0,
      avgDuration: avgDuration._avg.duration || 0
    }
  })
})

export { app as webhooksRoutes }
