import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { prisma } from '../lib/prisma'
import { redis } from '../lib/redis'
import { sendEmail } from '../services/email'

const app = new Hono()

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

// ==================== SCHEMAS ====================

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  company: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

const forgotPasswordSchema = z.object({
  email: z.string().email()
})

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8).max(100)
})

// ==================== ROUTES ====================

// Register
app.post('/register', zValidator('json', registerSchema), async (c) => {
  const { name, email, password, company } = c.req.valid('json')

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  })

  if (existingUser) {
    return c.json({
      success: false,
      error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists' }
    }, 400)
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12)

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
    }
  })

  // Create default workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: company || `${name}'s Workspace`,
      slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${nanoid(6)}`,
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

  // Create default form
  await prisma.form.create({
    data: {
      workspaceId: workspace.id,
      name: 'My First Form',
      emailTo: [user.email]
    }
  })

  // Generate JWT
  const token = generateToken(user)

  // Create session
  await createSession(user.id, token, c)

  // Send welcome email (async)
  sendWelcomeEmail(user).catch(console.error)

  // Log audit
  await logAudit(user.id, 'user.registered', { email: user.email }, c)

  return c.json({
    success: true,
    message: 'Account created successfully',
    data: {
      user: sanitizeUser(user),
      workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug },
      token
    }
  }, 201)
})

// Login
app.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')

  // Check rate limiting
  const ip = getClientIP(c)
  const rateLimitKey = `login:${ip}`
  const attempts = await redis.incr(rateLimitKey)
  
  if (attempts === 1) {
    await redis.expire(rateLimitKey, 900) // 15 minutes
  }
  
  if (attempts > 10) {
    return c.json({
      success: false,
      error: { code: 'TOO_MANY_ATTEMPTS', message: 'Too many login attempts. Please try again later.' }
    }, 429)
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  })

  if (!user || !user.passwordHash) {
    await logAudit(null, 'login.failed', { email, reason: 'user_not_found' }, c)
    return c.json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
    }, 401)
  }

  // Check if locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return c.json({
      success: false,
      error: { 
        code: 'ACCOUNT_LOCKED', 
        message: 'Account is temporarily locked. Please try again later.',
        lockedUntil: user.lockedUntil.toISOString()
      }
    }, 423)
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash)

  if (!isValid) {
    // Increment failed attempts
    const failedAttempts = user.failedLoginAttempts + 1
    const updates: any = { failedLoginAttempts: failedAttempts }
    
    // Lock after 5 failed attempts
    if (failedAttempts >= 5) {
      updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: updates
    })

    await logAudit(user.id, 'login.failed', { reason: 'invalid_password' }, c)
    
    return c.json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
    }, 401)
  }

  // Check if active
  if (!user.isActive) {
    return c.json({
      success: false,
      error: { code: 'ACCOUNT_DISABLED', message: 'Your account has been disabled' }
    }, 403)
  }

  // Success! Reset failed attempts and update last login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: ip
    }
  })

  // Clear rate limit on success
  await redis.del(rateLimitKey)

  // Generate JWT
  const token = generateToken(user)

  // Create session
  await createSession(user.id, token, c)

  // Log audit
  await logAudit(user.id, 'login.success', {}, c)

  // Get user's workspaces
  const workspaces = await prisma.workspaceMember.findMany({
    where: { userId: user.id },
    include: {
      workspace: {
        select: { id: true, name: true, slug: true }
      }
    }
  })

  return c.json({
    success: true,
    message: 'Login successful',
    data: {
      user: sanitizeUser(user),
      workspaces: workspaces.map(w => w.workspace),
      token
    }
  })
})

// Logout
app.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization')
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    
    // Blacklist the token
    const decoded = jwt.decode(token) as { exp: number } | null
    if (decoded?.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000)
      if (ttl > 0) {
        await redis.setex(`blacklist:${token}`, ttl, '1')
      }
    }

    // Delete session
    await prisma.session.deleteMany({
      where: { token }
    })
  }

  return c.json({ success: true, message: 'Logged out successfully' })
})

// Get current user
app.get('/me', async (c) => {
  const user = c.get('user')
  
  if (!user) {
    return c.json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
    }, 401)
  }

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      workspaces: {
        include: {
          workspace: {
            select: { id: true, name: true, slug: true, logo: true }
          }
        }
      }
    }
  })

  if (!fullUser) {
    return c.json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' }
    }, 404)
  }

  return c.json({
    success: true,
    data: {
      user: sanitizeUser(fullUser),
      workspaces: fullUser.workspaces.map(w => ({
        ...w.workspace,
        role: w.role
      }))
    }
  })
})

// Forgot password
app.post('/forgot-password', zValidator('json', forgotPasswordSchema), async (c) => {
  const { email } = c.req.valid('json')

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  })

  // Always return success to prevent email enumeration
  if (!user) {
    return c.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.'
    })
  }

  // Generate reset token
  const token = nanoid(32)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Store in Redis
  await redis.setex(`reset:${token}`, 3600, user.id)

  // Send email
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`
  await sendEmail({
    to: user.email,
    subject: 'Reset your password - InputHaven',
    html: `
      <h2>Reset Your Password</h2>
      <p>Hi ${user.name},</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  })

  await logAudit(user.id, 'password.reset_requested', {}, c)

  return c.json({
    success: true,
    message: 'If an account exists with this email, you will receive a password reset link.'
  })
})

// Reset password
app.post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
  const { token, password } = c.req.valid('json')

  // Get user ID from Redis
  const userId = await redis.get(`reset:${token}`)

  if (!userId) {
    return c.json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired reset token' }
    }, 400)
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(password, 12)

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      passwordChangedAt: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null
    }
  })

  // Delete reset token
  await redis.del(`reset:${token}`)

  // Invalidate all sessions
  await prisma.session.deleteMany({
    where: { userId }
  })

  await logAudit(userId, 'password.reset_completed', {}, c)

  return c.json({
    success: true,
    message: 'Password reset successfully. Please log in with your new password.'
  })
})

// ==================== HELPERS ====================

function generateToken(user: any): string {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

async function createSession(userId: string, token: string, c: any) {
  const decoded = jwt.decode(token) as { exp: number }
  
  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt: new Date(decoded.exp * 1000),
      ipAddress: getClientIP(c),
      userAgent: c.req.header('User-Agent')
    }
  })
}

function sanitizeUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    plan: user.plan,
    planExpiresAt: user.planExpiresAt,
    emailVerified: !!user.emailVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt
  }
}

function getClientIP(c: any): string {
  return (
    c.req.header('CF-Connecting-IP') ||
    c.req.header('X-Real-IP') ||
    c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  )
}

async function logAudit(userId: string | null, action: string, details: any, c: any) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource: 'auth',
        details,
        ipAddress: getClientIP(c),
        userAgent: c.req.header('User-Agent')
      }
    })
  } catch (error) {
    console.error('Failed to log audit:', error)
  }
}

async function sendWelcomeEmail(user: any) {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to InputHaven! 🎉',
    html: `
      <h2>Welcome to InputHaven, ${user.name}!</h2>
      <p>Thank you for signing up. You're now ready to start collecting form submissions.</p>
      <h3>Quick Start:</h3>
      <ol>
        <li>Create a form in your dashboard</li>
        <li>Copy the integration code to your website</li>
        <li>Start receiving submissions!</li>
      </ol>
      <a href="${process.env.APP_URL}/dashboard" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;">Go to Dashboard</a>
      <p>Need help? Check out our <a href="${process.env.APP_URL}/docs">documentation</a> or reply to this email.</p>
    `
  })
}

export { app as authRoutes }
