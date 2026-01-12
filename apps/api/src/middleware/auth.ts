import { Context, Next } from 'hono'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { redis } from '../lib/redis'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

declare module 'hono' {
  interface ContextVariableMap {
    user: {
      id: string
      email: string
      name: string
      plan: string
      isAdmin: boolean
    }
  }
}

export async function authMiddleware(c: Context, next: Next) {
  // Skip auth for public routes
  const publicPaths = ['/v1/auth', '/v1/submit', '/health']
  if (publicPaths.some(path => c.req.path.startsWith(path))) {
    return next()
  }

  // Check for Authorization header
  const authHeader = c.req.header('Authorization')
  const apiKey = c.req.header('X-API-Key')

  // API Key authentication
  if (apiKey) {
    return handleApiKeyAuth(c, apiKey, next)
  }

  // JWT authentication
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    return handleJWTAuth(c, token, next)
  }

  // No authentication provided
  return c.json({
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Provide a Bearer token or API key.'
    }
  }, 401)
}

async function handleJWTAuth(c: Context, token: string, next: Next) {
  try {
    // Check if token is blacklisted (logged out)
    const isBlacklisted = await redis.get(`blacklist:${token}`)
    if (isBlacklisted) {
      return c.json({
        success: false,
        error: { code: 'TOKEN_REVOKED', message: 'Token has been revoked' }
      }, 401)
    }

    // Verify JWT
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload

    // Get user from cache or database
    const cacheKey = `user:${payload.userId}`
    let user = await redis.get(cacheKey)

    if (!user) {
      const dbUser = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          isAdmin: true,
          isActive: true
        }
      })

      if (!dbUser || !dbUser.isActive) {
        return c.json({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User not found or inactive' }
        }, 401)
      }

      user = JSON.stringify(dbUser)
      await redis.setex(cacheKey, 300, user) // Cache for 5 minutes
    }

    c.set('user', JSON.parse(user as string))
    return next()

  } catch (error) {
    console.error('JWT auth error:', error)
    return c.json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
    }, 401)
  }
}

async function handleApiKeyAuth(c: Context, apiKey: string, next: Next) {
  try {
    // Hash the API key to compare
    const crypto = await import('crypto')
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')

    // Check cache first
    const cacheKey = `apikey:${keyHash}`
    let userData = await redis.get(cacheKey)

    if (!userData) {
      // Look up in database
      const key = await prisma.apiKey.findUnique({
        where: { keyHash },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              plan: true,
              isAdmin: true,
              isActive: true
            }
          }
        }
      })

      if (!key || !key.isActive || !key.user.isActive) {
        return c.json({
          success: false,
          error: { code: 'INVALID_API_KEY', message: 'Invalid or inactive API key' }
        }, 401)
      }

      // Check expiration
      if (key.expiresAt && key.expiresAt < new Date()) {
        return c.json({
          success: false,
          error: { code: 'API_KEY_EXPIRED', message: 'API key has expired' }
        }, 401)
      }

      // Update last used
      await prisma.apiKey.update({
        where: { id: key.id },
        data: { 
          lastUsedAt: new Date(),
          usageCount: { increment: 1 }
        }
      })

      userData = JSON.stringify(key.user)
      await redis.setex(cacheKey, 60, userData) // Cache for 1 minute
    }

    c.set('user', JSON.parse(userData as string))
    return next()

  } catch (error) {
    console.error('API key auth error:', error)
    return c.json({
      success: false,
      error: { code: 'AUTH_ERROR', message: 'Authentication error' }
    }, 500)
  }
}