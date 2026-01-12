import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { nanoid } from 'nanoid'
import { prisma } from '../lib/prisma.js'
import { redis } from '../lib/redis.js'

const app = new Hono()

// Schemas
const createFormSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  workspaceId: z.string(),
  schema: z.any().optional(),
  emailTo: z.array(z.string().email()).optional(),
  webhookUrl: z.string().url().optional().nullable(),
  redirectUrl: z.string().url().optional().nullable(),
  successMessage: z.string().optional(),
  allowedDomains: z.array(z.string()).optional(),
  honeypotField: z.string().optional(),
  spamThreshold: z.number().min(0).max(1).optional(),
  autoTagEnabled: z.boolean().optional(),
  sentimentEnabled: z.boolean().optional()
})

const updateFormSchema = createFormSchema.partial().omit({ workspaceId: true })

// List forms
app.get('/', async (c) => {
  const user = c.get('user')
  const workspaceId = c.req.query('workspaceId')

  const forms = await prisma.form.findMany({
    where: {
      workspace: {
        members: {
          some: { userId: user.id }
        }
      },
      ...(workspaceId ? { workspaceId } : {}),
      isArchived: false
    },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { submissions: true }
      }
    }
  })

  return c.json({
    success: true,
    data: forms.map(form => ({
      ...form,
      submissionCount: form._count.submissions
    }))
  })
})

// Get single form
app.get('/:id', async (c) => {
  const user = c.get('user')
  const formId = c.req.param('id')

  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      workspace: {
        members: {
          some: { userId: user.id }
        }
      }
    },
    include: {
      workspace: {
        select: { id: true, name: true, slug: true }
      },
      _count: {
        select: { submissions: true }
      }
    }
  })

  if (!form) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Form not found' }
    }, 404)
  }

  return c.json({
    success: true,
    data: form
  })
})

// Create form
app.post('/', zValidator('json', createFormSchema), async (c) => {
  const user = c.get('user')
  const data = c.req.valid('json')

  // Verify workspace access
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: data.workspaceId,
      members: {
        some: { 
          userId: user.id,
          role: { in: ['OWNER', 'ADMIN', 'MEMBER'] }
        }
      }
    }
  })

  if (!workspace) {
    return c.json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'No access to this workspace' }
    }, 403)
  }

  // Generate unique access key
  const accessKey = nanoid(24)

  const form = await prisma.form.create({
    data: {
      workspaceId: data.workspaceId,
      name: data.name,
      description: data.description,
      accessKey,
      schema: data.schema || {},
      emailTo: data.emailTo || [user.email],
      webhookUrl: data.webhookUrl,
      redirectUrl: data.redirectUrl,
      successMessage: data.successMessage || 'Thank you for your submission!',
      allowedDomains: data.allowedDomains || [],
      honeypotField: data.honeypotField || '_gotcha',
      spamThreshold: data.spamThreshold ?? 0.7,
      autoTagEnabled: data.autoTagEnabled ?? false,
      sentimentEnabled: data.sentimentEnabled ?? false
    }
  })

  return c.json({
    success: true,
    data: form
  }, 201)
})

// Update form
app.patch('/:id', zValidator('json', updateFormSchema), async (c) => {
  const user = c.get('user')
  const formId = c.req.param('id')
  const data = c.req.valid('json')

  // Verify access
  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      workspace: {
        members: {
          some: { 
            userId: user.id,
            role: { in: ['OWNER', 'ADMIN', 'MEMBER'] }
          }
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

  const updated = await prisma.form.update({
    where: { id: formId },
    data
  })

  // Invalidate cache
  await redis.del(`form:${form.accessKey}`)

  return c.json({
    success: true,
    data: updated
  })
})

// Delete form
app.delete('/:id', async (c) => {
  const user = c.get('user')
  const formId = c.req.param('id')

  // Verify access (only owner/admin can delete)
  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      workspace: {
        members: {
          some: { 
            userId: user.id,
            role: { in: ['OWNER', 'ADMIN'] }
          }
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

  // Soft delete (archive)
  await prisma.form.update({
    where: { id: formId },
    data: { isArchived: true }
  })

  // Invalidate cache
  await redis.del(`form:${form.accessKey}`)

  return c.json({
    success: true,
    message: 'Form deleted successfully'
  })
})

// Get form integration code
app.get('/:id/integration', async (c) => {
  const user = c.get('user')
  const formId = c.req.param('id')

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

  const apiUrl = process.env.API_URL || 'http://localhost:3001'

  const htmlCode = `<form action="${apiUrl}/v1/submit" method="POST">
  <input type="hidden" name="access_key" value="${form.accessKey}">
  <input type="hidden" name="${form.honeypotField}" style="display:none">
  
  <label for="name">Name</label>
  <input type="text" name="name" required>
  
  <label for="email">Email</label>
  <input type="email" name="email" required>
  
  <label for="message">Message</label>
  <textarea name="message" required></textarea>
  
  <button type="submit">Send</button>
</form>`

  const ajaxCode = `fetch('${apiUrl}/v1/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    access_key: '${form.accessKey}',
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello!'
  })
})
.then(res => res.json())
.then(data => console.log(data))`

  return c.json({
    success: true,
    data: {
      accessKey: form.accessKey,
      endpoint: `${apiUrl}/v1/submit`,
      examples: {
        html: htmlCode,
        ajax: ajaxCode
      }
    }
  })
})

// Regenerate access key
app.post('/:id/regenerate-key', async (c) => {
  const user = c.get('user')
  const formId = c.req.param('id')

  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      workspace: {
        members: {
          some: { 
            userId: user.id,
            role: { in: ['OWNER', 'ADMIN'] }
          }
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

  // Invalidate old cache
  await redis.del(`form:${form.accessKey}`)

  // Generate new key
  const newAccessKey = nanoid(24)

  const updated = await prisma.form.update({
    where: { id: formId },
    data: { accessKey: newAccessKey }
  })

  return c.json({
    success: true,
    data: { accessKey: updated.accessKey }
  })
})

export { app as formsRoutes }
