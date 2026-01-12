import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../../lib/prisma.js'

const app = new Hono()

// Template schemas
const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  type: z.enum([
    'FORM_SCHEMA',
    'EMAIL_NOTIFICATION', 
    'AUTO_RESPONSE',
    'WEBHOOK_PAYLOAD',
    'AI_PROCESSOR',
    'OUTPUT_TRANSFORM',
    'AGENT_INSTRUCTION'
  ]),
  category: z.string().optional(),
  description: z.string().optional(),
  schema: z.any(),
  semantics: z.any().optional(),
  aiInstructions: z.any().optional(),
  aiEnabled: z.boolean().optional(),
  mcpEnabled: z.boolean().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  bodyHtml: z.string().optional()
})

// List templates
app.get('/', async (c) => {
  const user = c.get('user')
  const type = c.req.query('type')
  const category = c.req.query('category')
  const includeSystem = c.req.query('includeSystem') === 'true'
  const includePublic = c.req.query('includePublic') === 'true'
  
  // Get user's workspaces
  const workspaces = await prisma.workspace.findMany({
    where: { members: { some: { userId: user.id } } },
    select: { id: true }
  })
  
  const workspaceIds = workspaces.map(w => w.id)
  
  const orConditions: any[] = [
    { workspaceId: { in: workspaceIds } }
  ]
  
  if (includeSystem) {
    orConditions.push({ isSystem: true })
  }
  
  if (includePublic) {
    orConditions.push({ isPublic: true })
  }
  
  const where: any = { OR: orConditions }
  
  if (type) where.type = type
  if (category) where.category = category
  
  const templates = await prisma.template.findMany({
    where,
    orderBy: [
      { isSystem: 'desc' },
      { usageCount: 'desc' },
      { createdAt: 'desc' }
    ],
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      category: true,
      description: true,
      ufpVersion: true,
      isSystem: true,
      isPublic: true,
      isPublished: true,
      usageCount: true,
      rating: true,
      version: true,
      aiEnabled: true,
      mcpEnabled: true,
      createdAt: true,
      updatedAt: true
    }
  })
  
  return c.json({ success: true, data: templates })
})

// Get single template
app.get('/:id', async (c) => {
  const user = c.get('user')
  const templateId = c.req.param('id')
  
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    include: {
      versions: {
        orderBy: { version: 'desc' },
        take: 5
      },
      workspace: {
        select: { id: true, name: true }
      }
    }
  })
  
  if (!template) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Template not found' }
    }, 404)
  }
  
  // Check access (owner, system, or public)
  if (!template.isSystem && !template.isPublic) {
    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId: template.workspaceId, userId: user.id }
    })
    
    if (!member) {
      return c.json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'No access to template' }
      }, 403)
    }
  }
  
  return c.json({ success: true, data: template })
})

// Create template
app.post('/', zValidator('json', createTemplateSchema), async (c) => {
  const user = c.get('user')
  const data = c.req.valid('json')
  const workspaceId = c.req.query('workspaceId')
  
  if (!workspaceId) {
    // Get user's first workspace
    const workspace = await prisma.workspace.findFirst({
      where: { members: { some: { userId: user.id } } }
    })
    
    if (!workspace) {
      return c.json({
        success: false,
        error: { code: 'NO_WORKSPACE', message: 'No workspace found. Create a workspace first.' }
      }, 400)
    }
  }
  
  const targetWorkspaceId = workspaceId || (await prisma.workspace.findFirst({
    where: { members: { some: { userId: user.id } } }
  }))?.id
  
  if (!targetWorkspaceId) {
    return c.json({
      success: false,
      error: { code: 'NO_WORKSPACE', message: 'No workspace available' }
    }, 400)
  }
  
  // Verify workspace access
  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: targetWorkspaceId, userId: user.id }
  })
  
  if (!member) {
    return c.json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'No access to workspace' }
    }, 403)
  }
  
  // Check slug uniqueness within workspace
  const existing = await prisma.template.findFirst({
    where: { workspaceId: targetWorkspaceId, slug: data.slug }
  })
  
  if (existing) {
    return c.json({
      success: false,
      error: { code: 'SLUG_EXISTS', message: 'Template slug already exists in this workspace' }
    }, 400)
  }
  
  const template = await prisma.template.create({
    data: {
      name: data.name,
      slug: data.slug,
      type: data.type,
      category: data.category,
      description: data.description,
      schema: data.schema,
      semantics: data.semantics,
      aiInstructions: data.aiInstructions,
      aiEnabled: data.aiEnabled ?? true,
      mcpEnabled: data.mcpEnabled ?? true,
      subject: data.subject,
      body: data.body,
      bodyHtml: data.bodyHtml,
      workspaceId: targetWorkspaceId,
      ufpVersion: '1.0'
    }
  })
  
  // Create initial version
  await prisma.templateVersion.create({
    data: {
      templateId: template.id,
      version: 1,
      schema: data.schema,
      createdBy: user.id
    }
  })
  
  return c.json({ success: true, data: template }, 201)
})

// Update template
app.patch('/:id', async (c) => {
  const user = c.get('user')
  const templateId = c.req.param('id')
  const data = await c.req.json()
  
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    include: { workspace: true }
  })
  
  if (!template) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Template not found' }
    }, 404)
  }
  
  if (template.isSystem) {
    return c.json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Cannot modify system template' }
    }, 403)
  }
  
  // Verify access
  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: template.workspaceId, userId: user.id }
  })
  
  if (!member) {
    return c.json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'No access to template' }
    }, 403)
  }
  
  // If schema changed, create new version
  if (data.schema && JSON.stringify(data.schema) !== JSON.stringify(template.schema)) {
    const newVersion = template.version + 1
    
    await prisma.templateVersion.create({
      data: {
        templateId,
        version: newVersion,
        schema: data.schema,
        changelog: data.changelog,
        createdBy: user.id
      }
    })
    
    data.version = newVersion
  }
  
  // Remove changelog from update data
  delete data.changelog
  
  const updated = await prisma.template.update({
    where: { id: templateId },
    data
  })
  
  return c.json({ success: true, data: updated })
})

// Delete template
app.delete('/:id', async (c) => {
  const user = c.get('user')
  const templateId = c.req.param('id')
  
  const template = await prisma.template.findUnique({
    where: { id: templateId }
  })
  
  if (!template) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Template not found' }
    }, 404)
  }
  
  if (template.isSystem) {
    return c.json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Cannot delete system template' }
    }, 403)
  }
  
  // Verify access
  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: template.workspaceId, userId: user.id }
  })
  
  if (!member) {
    return c.json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'No access to template' }
    }, 403)
  }
  
  await prisma.template.delete({ where: { id: templateId } })
  
  return c.json({ success: true, message: 'Template deleted' })
})

// Duplicate template
app.post('/:id/duplicate', async (c) => {
  const user = c.get('user')
  const templateId = c.req.param('id')
  const { name, workspaceId } = await c.req.json()
  
  const template = await prisma.template.findUnique({
    where: { id: templateId }
  })
  
  if (!template) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Template not found' }
    }, 404)
  }
  
  // Determine target workspace
  const targetWorkspaceId = workspaceId || template.workspaceId
  
  // Verify access to target workspace
  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: targetWorkspaceId, userId: user.id }
  })
  
  if (!member) {
    return c.json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'No access to target workspace' }
    }, 403)
  }
  
  const newSlug = `${template.slug}-copy-${Date.now()}`
  
  const duplicate = await prisma.template.create({
    data: {
      name: name || `${template.name} (Copy)`,
      slug: newSlug,
      type: template.type,
      category: template.category,
      description: template.description,
      schema: template.schema as any,
      semantics: template.semantics as any,
      aiInstructions: template.aiInstructions as any,
      aiEnabled: template.aiEnabled,
      mcpEnabled: template.mcpEnabled,
      subject: template.subject,
      body: template.body,
      bodyHtml: template.bodyHtml,
      workspaceId: targetWorkspaceId,
      ufpVersion: template.ufpVersion
    }
  })
  
  // Create initial version
  await prisma.templateVersion.create({
    data: {
      templateId: duplicate.id,
      version: 1,
      schema: template.schema as any,
      createdBy: user.id
    }
  })
  
  return c.json({ success: true, data: duplicate }, 201)
})

// Get template versions
app.get('/:id/versions', async (c) => {
  const templateId = c.req.param('id')
  
  const versions = await prisma.templateVersion.findMany({
    where: { templateId },
    orderBy: { version: 'desc' }
  })
  
  return c.json({ success: true, data: versions })
})

// Restore template version
app.post('/:id/versions/:version/restore', async (c) => {
  const user = c.get('user')
  const templateId = c.req.param('id')
  const versionNum = parseInt(c.req.param('version'))
  
  const template = await prisma.template.findUnique({
    where: { id: templateId }
  })
  
  if (!template) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Template not found' }
    }, 404)
  }
  
  const version = await prisma.templateVersion.findFirst({
    where: { templateId, version: versionNum }
  })
  
  if (!version) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Version not found' }
    }, 404)
  }
  
  // Create new version with restored schema
  const newVersion = template.version + 1
  
  await prisma.templateVersion.create({
    data: {
      templateId,
      version: newVersion,
      schema: version.schema as any,
      changelog: `Restored from version ${versionNum}`,
      createdBy: user.id
    }
  })
  
  const updated = await prisma.template.update({
    where: { id: templateId },
    data: {
      schema: version.schema as any,
      version: newVersion
    }
  })
  
  return c.json({ success: true, data: updated })
})

// Publish template to library
app.post('/:id/publish', async (c) => {
  const user = c.get('user')
  const templateId = c.req.param('id')
  
  const template = await prisma.template.findUnique({
    where: { id: templateId }
  })
  
  if (!template) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Template not found' }
    }, 404)
  }
  
  // Verify access
  const member = await prisma.workspaceMember.findFirst({
    where: { 
      workspaceId: template.workspaceId, 
      userId: user.id,
      role: { in: ['OWNER', 'ADMIN'] }
    }
  })
  
  if (!member) {
    return c.json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Only workspace owners/admins can publish templates' }
    }, 403)
  }
  
  const updated = await prisma.template.update({
    where: { id: templateId },
    data: { isPublished: true, isPublic: true }
  })
  
  return c.json({ success: true, data: updated })
})

// Unpublish template
app.post('/:id/unpublish', async (c) => {
  const user = c.get('user')
  const templateId = c.req.param('id')
  
  const template = await prisma.template.findUnique({
    where: { id: templateId }
  })
  
  if (!template) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Template not found' }
    }, 404)
  }
  
  const updated = await prisma.template.update({
    where: { id: templateId },
    data: { isPublished: false, isPublic: false }
  })
  
  return c.json({ success: true, data: updated })
})

// Attach template to form
app.post('/:id/attach', async (c) => {
  const user = c.get('user')
  const templateId = c.req.param('id')
  const { formId, purpose, config } = await c.req.json()
  
  if (!formId || !purpose) {
    return c.json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'formId and purpose are required' }
    }, 400)
  }
  
  // Verify template exists
  const template = await prisma.template.findUnique({
    where: { id: templateId }
  })
  
  if (!template) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Template not found' }
    }, 404)
  }
  
  // Verify form access
  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      workspace: {
        members: { some: { userId: user.id } }
      }
    }
  })
  
  if (!form) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Form not found' }
    }, 404)
  }
  
  // Check if already attached
  const existing = await prisma.formTemplate.findFirst({
    where: { formId, templateId, purpose }
  })
  
  if (existing) {
    // Update existing
    const updated = await prisma.formTemplate.update({
      where: { id: existing.id },
      data: { config: config || {}, isActive: true }
    })
    return c.json({ success: true, data: updated })
  }
  
  // Create new attachment
  const formTemplate = await prisma.formTemplate.create({
    data: {
      formId,
      templateId,
      purpose,
      config: config || {}
    }
  })
  
  // Increment usage count
  await prisma.template.update({
    where: { id: templateId },
    data: { usageCount: { increment: 1 } }
  })
  
  return c.json({ success: true, data: formTemplate }, 201)
})

// Get template library (public templates)
app.get('/library/browse', async (c) => {
  const category = c.req.query('category')
  const search = c.req.query('search')
  const type = c.req.query('type')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  
  const where: any = {
    OR: [
      { isPublic: true },
      { isSystem: true }
    ]
  }
  
  if (category) where.category = category
  if (type) where.type = type
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ]
  }
  
  const [templates, total] = await Promise.all([
    prisma.template.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { rating: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        category: true,
        description: true,
        isSystem: true,
        usageCount: true,
        rating: true,
        createdAt: true
      }
    }),
    prisma.template.count({ where })
  ])
  
  return c.json({
    success: true,
    data: templates,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  })
})

// Get template categories
app.get('/library/categories', async (c) => {
  const categories = await prisma.template.groupBy({
    by: ['category'],
    where: {
      OR: [
        { isPublic: true },
        { isSystem: true }
      ],
      category: { not: null }
    },
    _count: true
  })
  
  return c.json({
    success: true,
    data: categories.map(cat => ({
      name: cat.category,
      count: cat._count
    }))
  })
})

export { app as templatesRoutes }
