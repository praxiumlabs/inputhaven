/**
 * Integrations API Routes
 * 
 * CRUD operations for workspace integrations
 */

import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'
import {
  INTEGRATION_DEFINITIONS,
  validateIntegrationConfig,
  testIntegration,
  maskConfig,
  type IntegrationType,
  type IntegrationConfig
} from '../services/integrations/index.js'

const app = new Hono()

// ==================== LIST INTEGRATIONS ====================

/**
 * GET /integrations
 * List all integrations for the current workspace
 */
app.get('/', async (c) => {
  const user = c.get('user')
  const workspaceId = c.req.query('workspaceId')

  if (!workspaceId) {
    return c.json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'workspaceId is required' }
    }, 400)
  }

  // Verify user has access to workspace
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: user.id
    }
  })

  if (!membership) {
    return c.json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Access denied' }
    }, 403)
  }

  const integrations = await prisma.integration.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' }
  })

  // Mask sensitive config data
  const maskedIntegrations = integrations.map(integration => ({
    ...integration,
    config: maskConfig(integration.config as IntegrationConfig)
  }))

  return c.json({
    success: true,
    data: maskedIntegrations
  })
})

// ==================== GET INTEGRATION ====================

/**
 * GET /integrations/:id
 * Get a single integration
 */
app.get('/:id', async (c) => {
  const user = c.get('user')
  const integrationId = c.req.param('id')

  const integration = await prisma.integration.findFirst({
    where: {
      id: integrationId,
      workspace: {
        members: {
          some: { userId: user.id }
        }
      }
    }
  })

  if (!integration) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Integration not found' }
    }, 404)
  }

  return c.json({
    success: true,
    data: {
      ...integration,
      config: maskConfig(integration.config as IntegrationConfig)
    }
  })
})

// ==================== CREATE INTEGRATION ====================

/**
 * POST /integrations
 * Create a new integration
 */
app.post('/', async (c) => {
  const user = c.get('user')
  const body = await c.req.json()

  const { workspaceId, type, name, config } = body

  if (!workspaceId || !type || !name || !config) {
    return c.json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'workspaceId, type, name, and config are required' }
    }, 400)
  }

  // Verify user has admin access to workspace
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: user.id,
      role: { in: ['OWNER', 'ADMIN'] }
    }
  })

  if (!membership) {
    return c.json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Admin access required' }
    }, 403)
  }

  // Validate integration type
  if (!INTEGRATION_DEFINITIONS[type as IntegrationType]) {
    return c.json({
      success: false,
      error: { code: 'INVALID_TYPE', message: `Invalid integration type: ${type}` }
    }, 400)
  }

  // Validate config
  const validation = validateIntegrationConfig(type as IntegrationType, config)
  if (!validation.valid) {
    return c.json({
      success: false,
      error: { code: 'INVALID_CONFIG', message: validation.errors.join(', ') }
    }, 400)
  }

  // Create integration
  const integration = await prisma.integration.create({
    data: {
      workspaceId,
      type,
      name,
      config,
      isActive: true
    }
  })

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'integration.created',
      resource: 'integration',
      resourceId: integration.id,
      details: { type, name }
    }
  })

  return c.json({
    success: true,
    data: {
      ...integration,
      config: maskConfig(integration.config as IntegrationConfig)
    }
  }, 201)
})

// ==================== UPDATE INTEGRATION ====================

/**
 * PUT /integrations/:id
 * Update an integration
 */
app.put('/:id', async (c) => {
  const user = c.get('user')
  const integrationId = c.req.param('id')
  const body = await c.req.json()

  const { name, config, isActive } = body

  // Verify user has admin access
  const integration = await prisma.integration.findFirst({
    where: {
      id: integrationId,
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

  if (!integration) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Integration not found or access denied' }
    }, 404)
  }

  // If config is being updated, validate it
  if (config) {
    const validation = validateIntegrationConfig(integration.type as IntegrationType, config)
    if (!validation.valid) {
      return c.json({
        success: false,
        error: { code: 'INVALID_CONFIG', message: validation.errors.join(', ') }
      }, 400)
    }
  }

  // Update integration
  const updated = await prisma.integration.update({
    where: { id: integrationId },
    data: {
      ...(name && { name }),
      ...(config && { config }),
      ...(typeof isActive === 'boolean' && { isActive })
    }
  })

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'integration.updated',
      resource: 'integration',
      resourceId: integrationId,
      details: { name, isActive }
    }
  })

  return c.json({
    success: true,
    data: {
      ...updated,
      config: maskConfig(updated.config as IntegrationConfig)
    }
  })
})

// ==================== DELETE INTEGRATION ====================

/**
 * DELETE /integrations/:id
 * Delete an integration
 */
app.delete('/:id', async (c) => {
  const user = c.get('user')
  const integrationId = c.req.param('id')

  // Verify user has admin access
  const integration = await prisma.integration.findFirst({
    where: {
      id: integrationId,
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

  if (!integration) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Integration not found or access denied' }
    }, 404)
  }

  await prisma.integration.delete({
    where: { id: integrationId }
  })

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'integration.deleted',
      resource: 'integration',
      resourceId: integrationId,
      details: { type: integration.type, name: integration.name }
    }
  })

  return c.json({
    success: true,
    message: 'Integration deleted'
  })
})

// ==================== TEST INTEGRATION ====================

/**
 * POST /integrations/:id/test
 * Test an integration
 */
app.post('/:id/test', async (c) => {
  const user = c.get('user')
  const integrationId = c.req.param('id')

  // Verify user has access
  const integration = await prisma.integration.findFirst({
    where: {
      id: integrationId,
      workspace: {
        members: {
          some: { userId: user.id }
        }
      }
    }
  })

  if (!integration) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Integration not found' }
    }, 404)
  }

  const result = await testIntegration(
    integration.type as IntegrationType,
    integration.config as IntegrationConfig
  )

  return c.json({
    success: true,
    data: result
  })
})

/**
 * POST /integrations/test
 * Test integration config before saving
 */
app.post('/test', async (c) => {
  const user = c.get('user')
  const body = await c.req.json()

  const { workspaceId, type, config } = body

  if (!workspaceId || !type || !config) {
    return c.json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'workspaceId, type, and config are required' }
    }, 400)
  }

  // Verify user has access to workspace
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: user.id
    }
  })

  if (!membership) {
    return c.json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Access denied' }
    }, 403)
  }

  // Validate config first
  const validation = validateIntegrationConfig(type as IntegrationType, config)
  if (!validation.valid) {
    return c.json({
      success: false,
      data: { success: false, message: validation.errors.join(', ') }
    })
  }

  // Test the integration
  const result = await testIntegration(type as IntegrationType, config)

  return c.json({
    success: true,
    data: result
  })
})

// ==================== TOGGLE INTEGRATION ====================

/**
 * POST /integrations/:id/toggle
 * Enable/disable an integration
 */
app.post('/:id/toggle', async (c) => {
  const user = c.get('user')
  const integrationId = c.req.param('id')

  // Verify user has admin access
  const integration = await prisma.integration.findFirst({
    where: {
      id: integrationId,
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

  if (!integration) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Integration not found or access denied' }
    }, 404)
  }

  const updated = await prisma.integration.update({
    where: { id: integrationId },
    data: { isActive: !integration.isActive }
  })

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: integration.isActive ? 'integration.disabled' : 'integration.enabled',
      resource: 'integration',
      resourceId: integrationId
    }
  })

  return c.json({
    success: true,
    data: {
      ...updated,
      config: maskConfig(updated.config as IntegrationConfig)
    }
  })
})

// ==================== GET AVAILABLE INTEGRATIONS ====================

/**
 * GET /integrations/available
 * Get list of available integration types
 */
app.get('/available', async (c) => {
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

  return c.json({
    success: true,
    data: integrations
  })
})

// ==================== GET INTEGRATION LOGS ====================

/**
 * GET /integrations/:id/logs
 * Get execution logs for an integration
 */
app.get('/:id/logs', async (c) => {
  const user = c.get('user')
  const integrationId = c.req.param('id')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')

  // Note: This assumes an IntegrationLog model exists
  // If not using a separate model, logs might be in WebhookLog
  
  // Verify user has access
  const integration = await prisma.integration.findFirst({
    where: {
      id: integrationId,
      workspace: {
        members: {
          some: { userId: user.id }
        }
      }
    }
  })

  if (!integration) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Integration not found' }
    }, 404)
  }

  // For now, return empty logs - would need IntegrationLog model
  return c.json({
    success: true,
    data: [],
    pagination: {
      page,
      limit,
      total: 0,
      pages: 0
    }
  })
})

export { app as integrationsRoutes }
