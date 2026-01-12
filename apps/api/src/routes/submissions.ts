import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'

const app = new Hono()

// Update submission schema
const updateSubmissionSchema = z.object({
  isRead: z.boolean().optional(),
  isStarred: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  status: z.enum(['NEW', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'SPAM']).optional(),
  assignedTo: z.string().optional().nullable()
})

// List submissions
app.get('/', async (c) => {
  const user = c.get('user')
  const formId = c.req.query('formId')
  const status = c.req.query('status')
  const isSpam = c.req.query('isSpam')
  const isRead = c.req.query('isRead')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')

  const where: any = {
    form: {
      workspace: {
        members: {
          some: { userId: user.id }
        }
      }
    }
  }

  if (formId) where.formId = formId
  if (status) where.status = status
  if (isSpam !== undefined) where.isSpam = isSpam === 'true'
  if (isRead !== undefined) where.isRead = isRead === 'true'

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        form: {
          select: { id: true, name: true }
        }
      }
    }),
    prisma.submission.count({ where })
  ])

  return c.json({
    success: true,
    data: submissions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  })
})

// Get single submission
app.get('/:id', async (c) => {
  const user = c.get('user')
  const submissionId = c.req.param('id')

  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
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
        select: { id: true, name: true, workspaceId: true }
      },
      files: true,
      notes: {
        orderBy: { createdAt: 'desc' }
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 20
      }
    }
  })

  if (!submission) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Submission not found' }
    }, 404)
  }

  // Mark as read
  if (!submission.isRead) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { isRead: true }
    })
  }

  // Convert BigInt file sizes to Number
  const serializedSubmission = {
    ...submission,
    files: submission.files.map(file => ({
      ...file,
      size: Number(file.size)
    }))
  }

  return c.json({
    success: true,
    data: serializedSubmission
  })
})

// Update submission
app.patch('/:id', zValidator('json', updateSubmissionSchema), async (c) => {
  const user = c.get('user')
  const submissionId = c.req.param('id')
  const data = c.req.valid('json')

  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      form: {
        workspace: {
          members: {
            some: { userId: user.id }
          }
        }
      }
    }
  })

  if (!submission) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Submission not found' }
    }, 404)
  }

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data
  })

  // Log activity
  if (data.status && data.status !== submission.status) {
    await prisma.submissionActivity.create({
      data: {
        submissionId,
        action: 'status_changed',
        details: { from: submission.status, to: data.status },
        userId: user.id
      }
    })
  }

  return c.json({
    success: true,
    data: updated
  })
})

// Delete submission
app.delete('/:id', async (c) => {
  const user = c.get('user')
  const submissionId = c.req.param('id')

  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      form: {
        workspace: {
          members: {
            some: { 
              userId: user.id,
              role: { in: ['OWNER', 'ADMIN'] }
            }
          }
        }
      }
    }
  })

  if (!submission) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Submission not found' }
    }, 404)
  }

  await prisma.submission.delete({
    where: { id: submissionId }
  })

  return c.json({
    success: true,
    message: 'Submission deleted'
  })
})

// Add note to submission
app.post('/:id/notes', async (c) => {
  const user = c.get('user')
  const submissionId = c.req.param('id')
  const { content, isInternal = true } = await c.req.json()

  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      form: {
        workspace: {
          members: {
            some: { userId: user.id }
          }
        }
      }
    }
  })

  if (!submission) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Submission not found' }
    }, 404)
  }

  const note = await prisma.submissionNote.create({
    data: {
      submissionId,
      userId: user.id,
      content,
      isInternal
    }
  })

  // Log activity
  await prisma.submissionActivity.create({
    data: {
      submissionId,
      action: 'note_added',
      userId: user.id
    }
  })

  return c.json({
    success: true,
    data: note
  }, 201)
})

// Bulk update
app.post('/bulk', async (c) => {
  const user = c.get('user')
  const { ids, action, data } = await c.req.json()

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return c.json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'ids array is required' }
    }, 400)
  }

  // Verify access to all submissions
  const submissions = await prisma.submission.findMany({
    where: {
      id: { in: ids },
      form: {
        workspace: {
          members: {
            some: { userId: user.id }
          }
        }
      }
    }
  })

  if (submissions.length !== ids.length) {
    return c.json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Access denied to some submissions' }
    }, 403)
  }

  let updateData: any = {}

  switch (action) {
    case 'mark_read':
      updateData = { isRead: true }
      break
    case 'mark_unread':
      updateData = { isRead: false }
      break
    case 'archive':
      updateData = { isArchived: true }
      break
    case 'unarchive':
      updateData = { isArchived: false }
      break
    case 'mark_spam':
      updateData = { isSpam: true, status: 'SPAM' }
      break
    case 'mark_not_spam':
      updateData = { isSpam: false }
      break
    case 'update_status':
      updateData = { status: data.status }
      break
    case 'delete':
      await prisma.submission.deleteMany({
        where: { id: { in: ids } }
      })
      return c.json({
        success: true,
        message: `${ids.length} submissions deleted`
      })
    default:
      return c.json({
        success: false,
        error: { code: 'INVALID_ACTION', message: 'Invalid bulk action' }
      }, 400)
  }

  await prisma.submission.updateMany({
    where: { id: { in: ids } },
    data: updateData
  })

  return c.json({
    success: true,
    message: `${ids.length} submissions updated`
  })
})

export { app as submissionsRoutes }
