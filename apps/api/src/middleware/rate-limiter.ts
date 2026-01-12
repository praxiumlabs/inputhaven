import { Context, Next } from 'hono'
import { RateLimiterRedis } from 'rate-limiter-flexible'
import { redis } from '../lib/redis'

// Different rate limiters for different endpoints
const limiters = {
  // General API: 100 requests per minute
  general: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rl:general',
    points: 100,
    duration: 60,
    blockDuration: 60
  }),
  
  // Auth endpoints: 10 requests per minute (prevent brute force)
  auth: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rl:auth',
    points: 10,
    duration: 60,
    blockDuration: 300 // Block for 5 minutes if exceeded
  }),
  
  // Form submissions: 30 per minute per IP
  submit: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rl:submit',
    points: 30,
    duration: 60,
    blockDuration: 60
  }),
  
  // AI endpoints: 10 per minute (expensive)
  ai: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rl:ai',
    points: 10,
    duration: 60,
    blockDuration: 60
  })
}

export async function rateLimiter(c: Context, next: Next) {
  const path = c.req.path
  const user = c.get('user')
  
  // Determine which limiter to use
  let limiter = limiters.general
  if (path.includes('/auth')) {
    limiter = limiters.auth
  } else if (path.includes('/submit')) {
    limiter = limiters.submit
  } else if (path.includes('/ai')) {
    limiter = limiters.ai
  }
  
  // Use user ID if authenticated, otherwise IP
  const key = user?.id || getClientIP(c)
  
  try {
    const result = await limiter.consume(key)
    
    // Add rate limit headers
    c.header('X-RateLimit-Limit', limiter.points?.toString() || '100')
    c.header('X-RateLimit-Remaining', result.remainingPoints.toString())
    c.header('X-RateLimit-Reset', new Date(Date.now() + result.msBeforeNext).toISOString())
    
    return next()
  } catch (rateLimiterRes: any) {
    // Rate limited
    c.header('X-RateLimit-Limit', limiter.points?.toString() || '100')
    c.header('X-RateLimit-Remaining', '0')
    c.header('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString())
    c.header('Retry-After', Math.ceil(rateLimiterRes.msBeforeNext / 1000).toString())
    
    return c.json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please slow down.',
        retryAfter: Math.ceil(rateLimiterRes.msBeforeNext / 1000)
      }
    }, 429)
  }
}

function getClientIP(c: Context): string {
  return (
    c.req.header('CF-Connecting-IP') ||
    c.req.header('X-Real-IP') ||
    c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  )
}
