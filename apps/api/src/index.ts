import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { prettyJSON } from 'hono/pretty-json'
import { timing } from 'hono/timing'

// Routes
import { authRoutes } from './routes/auth.js'
import { formsRoutes } from './routes/forms.js'
import { submissionsRoutes } from './routes/submissions.js'
import { webhooksRoutes } from './routes/webhooks.js'
import { usersRoutes } from './routes/users.js'
import { workspacesRoutes } from './routes/workspaces.js'
import { analyticsRoutes } from './routes/analytics.js'
import { publicSubmitRoute } from './routes/public-submit.js'

// Middleware
import { authMiddleware } from './middleware/auth.js'
import { rateLimiter } from './middleware/rate-limiter.js'

// Types
import type { Context } from 'hono'

// Environment
const PORT = parseInt(process.env.PORT || '3001')
const isProduction = process.env.NODE_ENV === 'production'

// Create app
const app = new Hono()

// ==================== GLOBAL MIDDLEWARE ====================

// Security headers
app.use('*', secureHeaders())

// CORS - Fixed to include port 3002
app.use('*', cors({
  origin: isProduction 
    ? ['https://inputhaven.com', 'https://app.inputhaven.com']
    : ['http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposeHeaders: ['X-Request-Id', 'X-RateLimit-Remaining'],
  maxAge: 86400,
}))

// Request logging
app.use('*', logger())

// Response timing
app.use('*', timing())

// Pretty JSON in development
if (!isProduction) {
  app.use('*', prettyJSON())
}

// ==================== PUBLIC ROUTES ====================

// Health check
app.get('/health', (c: Context) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  })
})

// Public form submission endpoint (no auth required)
app.route('/v1/submit', publicSubmitRoute)

// Auth routes (login, register, etc.)
app.route('/v1/auth', authRoutes)

// ==================== PROTECTED ROUTES ====================

// Apply auth middleware to all /v1 routes except above
app.use('/v1/*', authMiddleware)

// Rate limiting for authenticated routes
app.use('/v1/*', rateLimiter)

// API routes
app.route('/v1/users', usersRoutes)
app.route('/v1/workspaces', workspacesRoutes)
app.route('/v1/forms', formsRoutes)
app.route('/v1/submissions', submissionsRoutes)
app.route('/v1/webhooks', webhooksRoutes)
app.route('/v1/analytics', analyticsRoutes)

// ==================== ERROR HANDLING ====================

// 404 handler
app.notFound((c: Context) => {
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist'
    }
  }, 404)
})

// Global error handler
app.onError((err: Error, c: Context) => {
  console.error('Unhandled error:', err)
  
  // Don't leak error details in production
  const message = isProduction 
    ? 'An unexpected error occurred' 
    : err.message
  
  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
      ...(isProduction ? {} : { stack: err.stack })
    }
  }, 500)
})

// ==================== START SERVER ====================

console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   📥 InputHaven API v2.0.0                    ║
║                                               ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(28)}║
║   Port: ${PORT.toString().padEnd(36)}║
║                                               ║
╚═══════════════════════════════════════════════╝
`)

serve({
  fetch: app.fetch,
  port: PORT,
}, (info) => {
  console.log(`✅ Server running at http://localhost:${info.port}`)
})

export default app
