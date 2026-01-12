import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { nanoid } from 'nanoid'
import { prisma } from '../lib/prisma.js'

const app = new Hono()

// Schemas
const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional()
})

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  logo: z.string().url().optional().nullable(),
  customDomain: z.string().optional().nullable()
})

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).optional()
})

// List workspaces
app.get('/', async (c) => {
  const user = c.get('user')

  const workspaces = await prisma.workspace.findMany({
    where: {
      members: {
        some: { userId: user.id }
      }
    },
    include: {
      members: {
        where: { userId: user.id },
        select: { role: true }
      },
      _count: {
        select: { forms: true, members: true }
      }
    }
  })

  return c.json({
    success: true,
    data: workspaces.map(w => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      logo: w.logo,
      role: w.members[0]?.role,
      formCount: w._count.forms,
      memberCount: w._count.members,
      createdAt: w.createdAt
    }))
  })
})

// Get single workspace
app.get('/:id', async (c) => {
  const user = c.get('user')
  const workspaceId = c.req.param('id')

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      members: {
        some: { userId: user.id }
      }
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      },
      owner: {
        select: { id: true, name: true, email: true }
      },
      _count: {
        select: { forms: true }
      }
    }
  })

  if (!workspace) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Workspace not found' }
    }, 404)
  }

  return c.json({
    success: true,
    data: workspace
  })
})

// Create workspace
app.post('/', zValidator('json', createWorkspaceSchema), async (c) => {
  const user = c.get('user')
  const { name, slug } = c.req.valid('json')

  // Generate slug if not provided
  const finalSlug = slug || `${name.toLowerCase().replace(/\s+/g, '-')}-${nanoid(6)}`

  // Check slug uniqueness
  const existing = await prisma.workspace.findUnique({
    where: { slug: finalSlug }
  })

  if (existing) {
    return c.json({
      success: false,
      error: { code: 'SLUG_EXISTS', message: 'This slug is already taken' }
    }, 400)
  }

  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug: finalSlug,
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'OWNER',
          joinedAt: new Date()
        }
      }
    }
  })

  return c.json({
    success: true,
    data: workspace
  }, 201)
})

// Update workspace
app.patch('/:id', zValidator('json', updateWorkspaceSchema), async (c) => {
  const user = c.get('user')
  const workspaceId = c.req.param('id')
  const data = c.req.valid('json')

  // Verify ownership/admin
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      members: {
        some: { 
          userId: user.id,
          role: { in: ['OWNER', 'ADMIN'] }
        }
      }
    }
  })

  if (!workspace) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Workspace not found' }
    }, 404)
  }

  const updated = await prisma.workspace.update({
    where: { id: workspaceId },
    data
  })

  return c.json({
    success: true,
    data: updated
  })
})

// Delete workspace
app.delete('/:id', async (c) => {
  const user = c.get('user')
  const workspaceId = c.req.param('id')

  // Only owner can delete
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      ownerId: user.id
    }
  })

  if (!workspace) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Workspace not found or not owner' }
    }, 404)
  }

  await prisma.workspace.delete({
    where: { id: workspaceId }
  })

  return c.json({
    success: true,
    message: 'Workspace deleted'
  })
})

// Invite member
app.post('/:id/members', zValidator('json', inviteMemberSchema), async (c) => {
  const user = c.get('user')
  const workspaceId = c.req.param('id')
  const { email, role = 'MEMBER' } = c.req.valid('json')

  // Verify admin access
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      members: {
        some: { 
          userId: user.id,
          role: { in: ['OWNER', 'ADMIN'] }
        }
      }
    }
  })

  if (!workspace) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Workspace not found' }
    }, 404)
  }

  // Find user to invite
  const invitedUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  })

  if (!invitedUser) {
    return c.json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found. They need to sign up first.' }
    }, 404)
  }

  // Check if already member
  const existingMember = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: invitedUser.id
    }
  })

  if (existingMember) {
    return c.json({
      success: false,
      error: { code: 'ALREADY_MEMBER', message: 'User is already a member' }
    }, 400)
  }

  const member = await prisma.workspaceMember.create({
    data: {
      workspaceId,
      userId: invitedUser.id,
      role,
      joinedAt: new Date()
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true }
      }
    }
  })

  return c.json({
    success: true,
    data: member
  }, 201)
})

// Update member role
app.patch('/:id/members/:memberId', async (c) => {
  const user = c.get('user')
  const workspaceId = c.req.param('id')
  const memberId = c.req.param('memberId')
  const { role } = await c.req.json()

  // Verify admin access
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      members: {
        some: { 
          userId: user.id,
          role: { in: ['OWNER', 'ADMIN'] }
        }
      }
    }
  })

  if (!workspace) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Workspace not found' }
    }, 404)
  }

  // Can't change owner
  const member = await prisma.workspaceMember.findUnique({
    where: { id: memberId }
  })

  if (!member || member.role === 'OWNER') {
    return c.json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'Cannot change owner role' }
    }, 400)
  }

  const updated = await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true }
      }
    }
  })

  return c.json({
    success: true,
    data: updated
  })
})

// Remove member
app.delete('/:id/members/:memberId', async (c) => {
  const user = c.get('user')
  const workspaceId = c.req.param('id')
  const memberId = c.req.param('memberId')

  // Verify admin access
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      members: {
        some: { 
          userId: user.id,
          role: { in: ['OWNER', 'ADMIN'] }
        }
      }
    }
  })

  if (!workspace) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Workspace not found' }
    }, 404)
  }

  // Can't remove owner
  const member = await prisma.workspaceMember.findUnique({
    where: { id: memberId }
  })

  if (!member || member.role === 'OWNER') {
    return c.json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'Cannot remove owner' }
    }, 400)
  }

  await prisma.workspaceMember.delete({
    where: { id: memberId }
  })

  return c.json({
    success: true,
    message: 'Member removed'
  })
})

// Leave workspace
app.post('/:id/leave', async (c) => {
  const user = c.get('user')
  const workspaceId = c.req.param('id')

  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: user.id
    }
  })

  if (!member) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Not a member of this workspace' }
    }, 404)
  }

  if (member.role === 'OWNER') {
    return c.json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'Owner cannot leave. Transfer ownership first.' }
    }, 400)
  }

  await prisma.workspaceMember.delete({
    where: { id: member.id }
  })

  return c.json({
    success: true,
    message: 'Left workspace'
  })
})

export { app as workspacesRoutes }
