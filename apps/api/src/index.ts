import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { prettyJSON } from 'hono/pretty-json'
import { timing } from 'hono/timing'

// Core Routes
import { authRoutes } from './routes/auth.js'
import { formsRoutes } from './routes/forms.js'
import { submissionsRoutes } from './routes/submissions.js'
import { webhooksRoutes } from './routes/webhooks.js'
import { usersRoutes } from './routes/users.js'
import { workspacesRoutes } from './routes/workspaces.js'
import { analyticsRoutes } from './routes/analytics.js'
import { publicSubmitRoute } from './routes/public-submit.js'

// UFP Routes (Universal Form Protocol)
import { templatesRoutes } from './routes/templates/index.js'
import { mcpRoutes } from './routes/mcp/index.js'
import { ufpRoutes } from './routes/ufp/index.js'

// Middleware
import { authMiddleware } from './middleware/auth.js'
import { rateLimiter } from './middleware/rate-limiter.js'

// Types
import type { Context } from 'hono'
import { integrationsRoutes } from './routes/integrations.js'


// Environment
const PORT = parseInt(process.env.PORT || '3001')
const isProduction = process.env.NODE_ENV === 'production'

// Create app
const app = new Hono()

// ==================== GLOBAL MIDDLEWARE ====================

// Security headers
app.use('*', secureHeaders())

// CORS - Support multiple origins including MCP clients
app.use('*', cors({
  origin: isProduction 
    ? ['https://inputhaven.com', 'https://app.inputhaven.com', 'https://api.inputhaven.com']
    : ['http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-MCP-Session', 'X-MCP-Agent', 'X-MCP-Version'],
  exposeHeaders: ['X-Request-Id', 'X-RateLimit-Remaining', 'X-UFP-Version'],
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

// ==================== DISCOVERY ENDPOINTS ====================

// Health check
app.get('/health', (c: Context) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    ufp_version: '1.0',
    environment: process.env.NODE_ENV || 'development'
  })
})

// UFP Well-Known Discovery Endpoint
// This is what AI agents and tools will discover first
app.get('/.well-known/ufp.json', (c: Context) => {
  const baseUrl = isProduction ? 'https://api.inputhaven.com' : `http://localhost:${PORT}`
  
  return c.json({
    ufp_version: '1.0',
    provider: {
      name: 'InputHaven',
      description: 'Universal Form Protocol - The standard for AI-native form handling',
      url: 'https://inputhaven.com',
      documentation: 'https://docs.inputhaven.com/ufp',
      support: 'support@inputhaven.com'
    },
    endpoints: {
      submit: `${baseUrl}/v1/submit`,
      submit_ufp: `${baseUrl}/v1/ufp/submit`,
      schema: `${baseUrl}/v1/ufp/forms/{form_id}/schema`,
      validate: `${baseUrl}/v1/ufp/forms/{form_id}/validate`,
      types: `${baseUrl}/v1/ufp/types`,
      directory: `${baseUrl}/v1/ufp/directory`
    },
    mcp: {
      manifest: `${baseUrl}/mcp/v1/manifest`,
      tools: `${baseUrl}/mcp/v1/tools`,
      resources: `${baseUrl}/mcp/v1/resources`,
      sessions: `${baseUrl}/mcp/v1/sessions`
    },
    capabilities: {
      ai_processing: true,
      semantic_types: true,
      mcp_protocol: true,
      webhooks: true,
      auto_response: true,
      real_time: false
    },
    authentication: {
      methods: ['api_key', 'mcp_session'],
      api_key_header: 'Authorization',
      mcp_session_header: 'X-MCP-Session'
    }
  })
})

// MCP Well-Known (alternative discovery path)
app.get('/.well-known/mcp.json', (c: Context) => {
  const baseUrl = isProduction ? 'https://api.inputhaven.com' : `http://localhost:${PORT}`
  
  return c.json({
    name: 'inputhaven',
    version: '1.0.0',
    protocol_version: '2024-11-05',
    manifest_url: `${baseUrl}/mcp/v1/manifest`
  })
})

// ==================== PUBLIC ROUTES (NO AUTH) ====================



// Public form submission endpoint
app.route('/v1/submit', publicSubmitRoute)

// Auth routes (login, register, etc.)
app.route('/v1/auth', authRoutes)

// MCP Server (has its own auth via session tokens)
app.route('/mcp/v1', mcpRoutes)

// UFP Public endpoints (schema discovery, semantic types)
app.route('/v1/ufp', ufpRoutes)


// Public integrations list (available types)
app.get('/v1/integrations/available', async (c) => {
  const { INTEGRATION_DEFINITIONS } = await import('./services/integrations/index.js')
  const integrations = Object.values(INTEGRATION_DEFINITIONS).map(def => ({
    type: def.type,
    name: def.name,
    description: def.description,
    icon: def.icon,
    color: def.color,
    category: def.category,
    features: def.features,
    docsUrl: def.docsUrl,
    configSchema: def.configSchema
  }))
  return c.json({ success: true, data: integrations })
})

// ==================== PROTECTED ROUTES ====================

// Apply auth middleware to all /v1 routes except those already handled above
app.use('/v1/*', authMiddleware)

// Rate limiting for authenticated routes
app.use('/v1/*', rateLimiter)

// Core API routes
app.route('/v1/users', usersRoutes)
app.route('/v1/workspaces', workspacesRoutes)
app.route('/v1/forms', formsRoutes)
app.route('/v1/submissions', submissionsRoutes)
app.route('/v1/webhooks', webhooksRoutes)
app.route('/v1/analytics', analyticsRoutes)
app.route('/v1/integrations', integrationsRoutes) 


// Template management (protected)
app.route('/v1/templates', templatesRoutes)

// ==================== ERROR HANDLING ====================

// 404 handler
app.notFound((c: Context) => {
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist',
      hint: 'Check /.well-known/ufp.json for available endpoints'
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
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   📥 InputHaven API v2.0.0                                ║
║   🌐 Universal Form Protocol v1.0                         ║
║                                                           ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(40)}║
║   Port: ${PORT.toString().padEnd(48)}║
║                                                           ║
║   Endpoints:                                              ║
║   ├─ REST API:     /v1/*                                  ║
║   ├─ MCP Server:   /mcp/v1/*                              ║
║   ├─ UFP:          /v1/ufp/*                              ║
║   └─ Discovery:    /.well-known/ufp.json                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`)

serve({
  fetch: app.fetch,
  port: PORT,
}, (info) => {
  console.log(`✅ Server running at http://localhost:${info.port}`)
  console.log(`📋 UFP Discovery: http://localhost:${info.port}/.well-known/ufp.json`)
  console.log(`🤖 MCP Manifest:  http://localhost:${info.port}/mcp/v1/manifest`)
})

export default app
