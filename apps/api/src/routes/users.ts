import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { redis } from '../lib/redis.js'

const app = new Hono()

// Update user schema
const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().url().optional().nullable()
})

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(100)
})

// Get current user profile
app.get('/me', async (c) => {
  const user = c.get('user')

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      plan: true,
      planExpiresAt: true,
      emailVerified: true,
      twoFactorEnabled: true,
      submissionsThisMonth: true,
      submissionsTotal: true,
      storageUsedBytes: true,
      createdAt: true,
      lastLoginAt: true
    }
  })

  if (!fullUser) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'User not found' }
    }, 404)
  }

  // Get plan limits
  const planLimits: Record<string, { submissions: number; forms: number; storage: number }> = {
    FREE: { submissions: 250, forms: 1, storage: 100 * 1024 * 1024 },
    STARTER: { submissions: 2500, forms: 10, storage: 1024 * 1024 * 1024 },
    PRO: { submissions: 25000, forms: -1, storage: 10 * 1024 * 1024 * 1024 },
    ENTERPRISE: { submissions: -1, forms: -1, storage: -1 }
  }

  const limits = planLimits[fullUser.plan] || planLimits.FREE

  // Convert BigInt to Number for JSON serialization
  const storageUsed = Number(fullUser.storageUsedBytes)

  return c.json({
    success: true,
    data: {
      id: fullUser.id,
      email: fullUser.email,
      name: fullUser.name,
      avatar: fullUser.avatar,
      plan: fullUser.plan,
      planExpiresAt: fullUser.planExpiresAt,
      emailVerified: fullUser.emailVerified,
      twoFactorEnabled: fullUser.twoFactorEnabled,
      submissionsThisMonth: fullUser.submissionsThisMonth,
      submissionsTotal: fullUser.submissionsTotal,
      storageUsedBytes: storageUsed,
      createdAt: fullUser.createdAt,
      lastLoginAt: fullUser.lastLoginAt,
      limits,
      usage: {
        submissions: fullUser.submissionsThisMonth,
        storage: storageUsed
      }
    }
  })
})

// Update user profile
app.patch('/me', zValidator('json', updateUserSchema), async (c) => {
  const user = c.get('user')
  const data = c.req.valid('json')

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true
    }
  })

  // Invalidate user cache
  await redis.del(`user:${user.id}`)

  return c.json({
    success: true,
    data: updated
  })
})

// Change password
app.post('/me/change-password', zValidator('json', changePasswordSchema), async (c) => {
  const user = c.get('user')
  const { currentPassword, newPassword } = c.req.valid('json')

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id }
  })

  if (!fullUser || !fullUser.passwordHash) {
    return c.json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'Cannot change password for this account' }
    }, 400)
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, fullUser.passwordHash)

  if (!isValid) {
    return c.json({
      success: false,
      error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' }
    }, 400)
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordChangedAt: new Date()
    }
  })

  // Invalidate all sessions except current
  await prisma.session.deleteMany({
    where: { userId: user.id }
  })

  return c.json({
    success: true,
    message: 'Password changed successfully'
  })
})

// Get user's API keys
app.get('/me/api-keys', async (c) => {
  const user = c.get('user')

  const apiKeys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      keyPreview: true,
      scopes: true,
      lastUsedAt: true,
      usageCount: true,
      expiresAt: true,
      isActive: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })

  // Convert BigInt usageCount to Number
  const serializedKeys = apiKeys.map(key => ({
    ...key,
    usageCount: Number(key.usageCount)
  }))

  return c.json({
    success: true,
    data: serializedKeys
  })
})

// Create API key
app.post('/me/api-keys', async (c) => {
  const user = c.get('user')
  const { name, scopes = ['read', 'write'], expiresAt } = await c.req.json()

  if (!name) {
    return c.json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'name is required' }
    }, 400)
  }

  // Generate API key
  const crypto = await import('crypto')
  const key = `ih_${crypto.randomBytes(32).toString('hex')}`
  const keyHash = crypto.createHash('sha256').update(key).digest('hex')
  const keyPreview = `${key.slice(0, 7)}...${key.slice(-4)}`

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: user.id,
      name,
      keyHash,
      keyPreview,
      scopes,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    }
  })

  return c.json({
    success: true,
    data: {
      id: apiKey.id,
      name: apiKey.name,
      key, // Only returned once!
      keyPreview: apiKey.keyPreview,
      scopes: apiKey.scopes,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt
    },
    message: 'Save this API key - it will not be shown again!'
  }, 201)
})

// Delete API key
app.delete('/me/api-keys/:id', async (c) => {
  const user = c.get('user')
  const keyId = c.req.param('id')

  const apiKey = await prisma.apiKey.findFirst({
    where: { id: keyId, userId: user.id }
  })

  if (!apiKey) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'API key not found' }
    }, 404)
  }

  await prisma.apiKey.delete({
    where: { id: keyId }
  })

  // Invalidate cache
  await redis.del(`apikey:${apiKey.keyHash}`)

  return c.json({
    success: true,
    message: 'API key deleted'
  })
})

// Get notifications
app.get('/me/notifications', async (c) => {
  const user = c.get('user')
  const unreadOnly = c.req.query('unread') === 'true'

  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.id,
      ...(unreadOnly ? { isRead: false } : {})
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  return c.json({
    success: true,
    data: notifications
  })
})

// Mark notifications as read
app.post('/me/notifications/read', async (c) => {
  const user = c.get('user')
  const { ids } = await c.req.json()

  if (ids && Array.isArray(ids)) {
    await prisma.notification.updateMany({
      where: { id: { in: ids }, userId: user.id },
      data: { isRead: true }
    })
  } else {
    // Mark all as read
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true }
    })
  }

  return c.json({
    success: true,
    message: 'Notifications marked as read'
  })
})

// Delete account
app.delete('/me', async (c) => {
  const user = c.get('user')
  const { password } = await c.req.json()

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id }
  })

  if (!fullUser || !fullUser.passwordHash) {
    return c.json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'Cannot delete this account' }
    }, 400)
  }

  // Verify password
  const isValid = await bcrypt.compare(password, fullUser.passwordHash)

  if (!isValid) {
    return c.json({
      success: false,
      error: { code: 'INVALID_PASSWORD', message: 'Password is incorrect' }
    }, 400)
  }

  // Delete user (cascades to related data)
  await prisma.user.delete({
    where: { id: user.id }
  })

  // Clear cache
  await redis.del(`user:${user.id}`)

  return c.json({
    success: true,
    message: 'Account deleted successfully'
  })
})

export { app as usersRoutes }
