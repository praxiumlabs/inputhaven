import { Hono } from 'hono'
import { prisma } from '../../lib/prisma.js'

const app = new Hono()

// ==================== UFP DISCOVERY ====================

// Well-known UFP discovery endpoint
app.get('/discovery', async (c) => {
  return c.json({
    ufp_version: "1.0",
    provider: {
      name: "InputHaven",
      url: "https://inputhaven.com",
      documentation: "https://docs.inputhaven.com/ufp"
    },
    endpoints: {
      submit: "/v1/submit",
      submit_ufp: "/v1/ufp/submit",
      schema: "/v1/ufp/forms/{form_id}/schema",
      validate: "/v1/ufp/forms/{form_id}/validate",
      types: "/v1/ufp/types",
      mcp: "/mcp/v1"
    },
    capabilities: {
      ai_processing: true,
      semantic_types: true,
      mcp_protocol: true,
      webhooks: true,
      auto_response: true
    }
  })
})

// ==================== UFP FORM SCHEMA ====================

// Get UFP-formatted form schema
app.get('/forms/:id/schema', async (c) => {
  const formId = c.req.param('id')
  
  const form = await prisma.form.findFirst({
    where: {
      OR: [
        { id: formId },
        { accessKey: formId },
        { ufpUri: `ufp://inputhaven.com/forms/${formId}` }
      ],
      isActive: true
    },
    include: {
      publicListing: true
    }
  })
  
  if (!form) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Form not found' }
    }, 404)
  }
  
  const schema = form.ufpSchema || form.schema || {}
  const semanticTypes = form.semanticTypes || {}
  const aiInstructions = form.aiInstructions || {}
  
  // Build UFP-compliant schema
  const ufpSchema = {
    $schema: "https://inputhaven.com/schemas/ufp-1.0.json",
    ufp_version: "1.0",
    
    form: {
      id: form.id,
      uri: form.ufpUri || `ufp://inputhaven.com/forms/${form.id}`,
      name: form.name,
      description: form.description,
      category: form.publicListing?.category
    },
    
    fields: buildUFPFields(schema, semanticTypes),
    
    submission: {
      endpoint: `https://api.inputhaven.com/v1/submit/${form.accessKey}`,
      methods: ["POST"],
      formats: ["application/json", "application/x-www-form-urlencoded", "multipart/form-data"],
      authentication: form.requireAuth ? "bearer" : "none"
    },
    
    ai: {
      enabled: form.aiEnabled,
      capabilities: {
        classify: form.aiClassify,
        sentiment: form.aiSentiment,
        summarize: form.aiSummarize,
        extract_entities: form.aiExtractEntities,
        auto_respond: form.aiAutoRespond
      },
      instructions: aiInstructions
    },
    
    mcp: {
      enabled: form.mcpEnabled,
      capabilities: form.mcpCapabilities,
      tools: ["submit_form", "get_form_schema", "validate_data"]
    },
    
    response: {
      success_message: form.successMessage,
      redirect_url: form.redirectUrl
    }
  }
  
  return c.json({
    success: true,
    data: ufpSchema
  })
})

// ==================== UFP SUBMISSION ====================

// UFP-compliant submission endpoint
app.post('/submit', async (c) => {
  const body = await c.req.json()
  
  const { form_id, data, metadata } = body
  
  if (!form_id) {
    return c.json({
      success: false,
      error: { code: 'MISSING_FORM_ID', message: 'form_id is required' }
    }, 400)
  }
  
  // Resolve form
  const formIdentifier = form_id
    .replace('ufp://inputhaven.com/forms/', '')
    .replace('ufp://inputhaven.com/f/', '')
  
  const form = await prisma.form.findFirst({
    where: {
      OR: [
        { id: formIdentifier },
        { accessKey: formIdentifier },
        { ufpUri: form_id }
      ],
      isActive: true,
      ufpEnabled: true
    }
  })
  
  if (!form) {
    return c.json({
      success: false,
      error: { code: 'FORM_NOT_FOUND', message: 'Form not found or UFP not enabled' }
    }, 404)
  }
  
  // Create submission
  const submission = await prisma.submission.create({
    data: {
      formId: form.id,
      data: data || {},
      metadata: {
        source: 'ufp',
        ufpVersion: '1.0',
        ...metadata,
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        userAgent: c.req.header('user-agent'),
        timestamp: new Date().toISOString()
      }
    }
  })
  
  // Update form stats
  await prisma.form.update({
    where: { id: form.id },
    data: {
      submissionCount: { increment: 1 },
      lastSubmissionAt: new Date()
    }
  })
  
  // Return UFP-compliant response
  return c.json({
    success: true,
    ufp_version: "1.0",
    submission: {
      id: submission.id,
      uri: `ufp://inputhaven.com/submissions/${submission.id}`,
      status: "received",
      created_at: submission.createdAt.toISOString()
    },
    form: {
      id: form.id,
      name: form.name
    },
    message: form.successMessage,
    _links: {
      self: { href: `/v1/submissions/${submission.id}` },
      form: { href: `/v1/ufp/forms/${form.id}/schema` },
      status: { href: `/v1/submissions/${submission.id}/status` }
    }
  }, 201)
})

// ==================== UFP VALIDATION ====================

app.post('/forms/:id/validate', async (c) => {
  const formId = c.req.param('id')
  const { data } = await c.req.json()
  
  const form = await prisma.form.findFirst({
    where: {
      OR: [
        { id: formId },
        { accessKey: formId }
      ]
    },
    select: { schema: true, ufpSchema: true }
  })
  
  if (!form) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Form not found' }
    }, 404)
  }
  
  const schema = form.ufpSchema || form.schema
  const errors = validateData(data, schema as any)
  
  return c.json({
    success: true,
    data: {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    }
  })
})

// ==================== SEMANTIC TYPE REGISTRY ====================

// Get all semantic types
app.get('/types', async (c) => {
  const namespace = c.req.query('namespace')
  
  const where: any = {}
  if (namespace) where.namespace = namespace
  
  const types = await prisma.semanticType.findMany({
    where,
    orderBy: [{ namespace: 'asc' }, { name: 'asc' }]
  })
  
  // Group by namespace
  const grouped = types.reduce((acc: any, t) => {
    if (!acc[t.namespace]) {
      acc[t.namespace] = {
        namespace: t.namespace,
        types: []
      }
    }
    acc[t.namespace].types.push({
      name: t.name,
      path: t.fullPath,
      description: t.description,
      examples: t.examples,
      jsonSchemaType: t.jsonSchemaType,
      schemaOrgType: t.schemaOrgType,
      validation: t.validation
    })
    return acc
  }, {})
  
  return c.json({
    success: true,
    data: {
      version: "1.0",
      namespaces: Object.values(grouped),
      total: types.length
    }
  })
})

// Get single semantic type
app.get('/types/:path', async (c) => {
  const path = c.req.param('path').replace('-', '.')
  
  const type = await prisma.semanticType.findUnique({
    where: { fullPath: path }
  })
  
  if (!type) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Semantic type not found: ${path}` }
    }, 404)
  }
  
  return c.json({
    success: true,
    data: {
      namespace: type.namespace,
      name: type.name,
      path: type.fullPath,
      description: type.description,
      examples: type.examples,
      validation: type.validation,
      formats: type.formats,
      jsonSchemaType: type.jsonSchemaType,
      schemaOrgType: type.schemaOrgType,
      openApiFormat: type.openApiFormat,
      aiDescription: type.aiDescription,
      aiExamples: type.aiExamples
    }
  })
})

// ==================== PUBLIC FORM DIRECTORY ====================

app.get('/directory', async (c) => {
  const category = c.req.query('category')
  const search = c.req.query('search')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  
  const where: any = {
    form: { isActive: true, ufpEnabled: true, mcpEnabled: true }
  }
  
  if (category) {
    where.category = category
  }
  
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } }
    ]
  }
  
  const [listings, total] = await Promise.all([
    prisma.publicForm.findMany({
      where,
      include: {
        form: {
          select: {
            id: true,
            name: true,
            description: true,
            mcpEnabled: true
          }
        }
      },
      orderBy: [
        { submitCount: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.publicForm.count({ where })
  ])
  
  return c.json({
    success: true,
    data: listings.map(l => ({
      ufp_uri: l.ufpUri,
      form_id: l.formId,
      title: l.title,
      description: l.description,
      category: l.category,
      tags: l.tags,
      verified: l.isVerified,
      stats: {
        views: l.viewCount,
        submissions: l.submitCount,
        rating: l.rating
      }
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  })
})

// Get directory categories
app.get('/directory/categories', async (c) => {
  const categories = await prisma.publicForm.groupBy({
    by: ['category'],
    _count: true,
    orderBy: { _count: { category: 'desc' } }
  })
  
  return c.json({
    success: true,
    data: categories.map(cat => ({
      name: cat.category,
      count: cat._count
    }))
  })
})

// ==================== HELPER FUNCTIONS ====================

function buildUFPFields(schema: any, semanticTypes: any): any[] {
  const fields: any[] = []
  const props = schema?.fields || schema?.properties || {}
  const required = schema?.required || []
  
  for (const [key, value] of Object.entries(props)) {
    const field = value as any
    const semanticType = semanticTypes?.[key]
    
    fields.push({
      name: key,
      type: field.type || 'string',
      semantic_type: semanticType || inferSemanticType(key, field),
      title: field.title || formatFieldName(key),
      description: field.description,
      required: required.includes(key) || field.required === true,
      validation: {
        format: field.format,
        pattern: field.pattern,
        minLength: field.minLength,
        maxLength: field.maxLength,
        minimum: field.minimum,
        maximum: field.maximum,
        enum: field.enum
      },
      ai_hints: {
        description: field.aiDescription || field.description,
        examples: field.examples || field.aiExamples,
        fill_instruction: field.aiInstruction
      }
    })
  }
  
  return fields
}

function inferSemanticType(fieldName: string, field: any): string | null {
  const name = fieldName.toLowerCase()
  
  // Person types
  if (name.includes('email')) return 'person.email'
  if (name.includes('phone') || name.includes('tel')) return 'person.phone'
  if (name === 'name' || name === 'full_name' || name === 'fullname') return 'person.full_name'
  if (name === 'first_name' || name === 'firstname') return 'person.first_name'
  if (name === 'last_name' || name === 'lastname') return 'person.last_name'
  
  // Organization types
  if (name.includes('company') || name.includes('organization')) return 'organization.name'
  if (name.includes('website') || name.includes('url')) return 'organization.website'
  if (name.includes('industry')) return 'organization.industry'
  
  // Content types
  if (name.includes('message') || name.includes('body') || name.includes('content')) return 'content.message'
  if (name.includes('subject') || name.includes('title')) return 'content.subject'
  if (name.includes('description')) return 'content.description'
  
  // Location types
  if (name.includes('address')) return 'location.address'
  if (name.includes('city')) return 'location.city'
  if (name.includes('country')) return 'location.country'
  if (name.includes('zip') || name.includes('postal')) return 'location.postal_code'
  
  return null
}

function formatFieldName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())
    .trim()
}

function validateData(data: any, schema: any): string[] {
  const errors: string[] = []
  
  if (!schema) return errors
  
  const fields = schema.fields || schema.properties || {}
  const required = schema.required || []
  
  // Check required fields
  for (const field of required) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`Missing required field: ${field}`)
    }
  }
  
  // Validate field types and formats
  for (const [key, value] of Object.entries(data)) {
    const fieldSchema = fields[key]
    if (!fieldSchema) continue
    
    const f = fieldSchema as any
    
    // Type validation
    if (f.type === 'string' && typeof value !== 'string') {
      errors.push(`${key} must be a string`)
    }
    if (f.type === 'number' && typeof value !== 'number') {
      errors.push(`${key} must be a number`)
    }
    if (f.type === 'integer' && (!Number.isInteger(value))) {
      errors.push(`${key} must be an integer`)
    }
    if (f.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`${key} must be a boolean`)
    }
    
    // String validations
    if (typeof value === 'string') {
      if (f.minLength && value.length < f.minLength) {
        errors.push(`${key} must be at least ${f.minLength} characters`)
      }
      if (f.maxLength && value.length > f.maxLength) {
        errors.push(`${key} must be at most ${f.maxLength} characters`)
      }
      if (f.pattern && !new RegExp(f.pattern).test(value)) {
        errors.push(`${key} does not match required format`)
      }
      if (f.format === 'email' && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors.push(`${key} must be a valid email address`)
      }
      if (f.format === 'uri') {
        try { new URL(value) } catch { errors.push(`${key} must be a valid URL`) }
      }
    }
    
    // Number validations
    if (typeof value === 'number') {
      if (f.minimum !== undefined && value < f.minimum) {
        errors.push(`${key} must be at least ${f.minimum}`)
      }
      if (f.maximum !== undefined && value > f.maximum) {
        errors.push(`${key} must be at most ${f.maximum}`)
      }
    }
    
    // Enum validation
    if (f.enum && !f.enum.includes(value)) {
      errors.push(`${key} must be one of: ${f.enum.join(', ')}`)
    }
  }
  
  return errors
}

export { app as ufpRoutes }
