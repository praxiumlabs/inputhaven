import { Hono } from 'hono'
import { prisma } from '../../lib/prisma.js'
import crypto from 'crypto'

const app = new Hono()

// ==================== MCP SERVER MANIFEST ====================
// This is what AI agents discover when connecting to InputHaven

app.get('/manifest', async (c) => {
  return c.json({
    name: "inputhaven",
    version: "1.0.0",
    protocol_version: "2024-11-05",
    description: "Universal Form Protocol (UFP) - The standard for structured data collection. InputHaven is the reference implementation for AI-native form handling.",
    
    vendor: {
      name: "InputHaven",
      url: "https://inputhaven.com",
      documentation: "https://docs.inputhaven.com/mcp"
    },
    
    capabilities: {
      tools: true,
      resources: true,
      prompts: true,
      logging: true
    },
    
    tools: [
      {
        name: "submit_form",
        description: "Submit data to a form. Use this when you need to send information to a business, fill out a contact form, submit feedback, or send any structured data on behalf of a user. Always call get_form_schema first to understand required fields.",
        inputSchema: {
          type: "object",
          properties: {
            form_id: {
              type: "string",
              description: "The form identifier. Can be a UFP URI (ufp://inputhaven.com/forms/...), form ID, or access key."
            },
            data: {
              type: "object",
              description: "Key-value pairs of form data. Use get_form_schema first to see required fields and their types."
            },
            on_behalf_of: {
              type: "string",
              description: "Optional: Name or identifier of the person this submission is for."
            },
            metadata: {
              type: "object",
              description: "Optional: Additional context like source, session_id, etc."
            }
          },
          required: ["form_id", "data"]
        }
      },
      {
        name: "get_form_schema",
        description: "Get the schema for a form to understand what fields are required, their types, and validation rules. ALWAYS call this before submit_form to ensure correct data format.",
        inputSchema: {
          type: "object",
          properties: {
            form_id: {
              type: "string",
              description: "The form identifier (UFP URI, form ID, or access key)"
            }
          },
          required: ["form_id"]
        }
      },
      {
        name: "check_submission",
        description: "Check the status of a previously submitted form. Use this to verify if a submission was received and processed.",
        inputSchema: {
          type: "object",
          properties: {
            submission_id: {
              type: "string",
              description: "The submission ID returned from submit_form"
            }
          },
          required: ["submission_id"]
        }
      },
      {
        name: "search_forms",
        description: "Search for available forms by category, keyword, or use case. Use this to find the right form for a user's needs when you don't have a specific form ID.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query (e.g., 'contact', 'support', 'feedback')"
            },
            category: {
              type: "string",
              enum: ["contact", "support", "feedback", "lead-gen", "registration", "survey", "application", "booking"],
              description: "Filter by category"
            },
            limit: {
              type: "integer",
              default: 10,
              description: "Maximum number of results to return"
            }
          }
        }
      },
      {
        name: "validate_data",
        description: "Validate form data against a form's schema without submitting. Use this to check if data is correct before submission.",
        inputSchema: {
          type: "object",
          properties: {
            form_id: {
              type: "string",
              description: "The form identifier"
            },
            data: {
              type: "object",
              description: "The data to validate"
            }
          },
          required: ["form_id", "data"]
        }
      }
    ],
    
    resources: [
      {
        uri_template: "ufp://inputhaven.com/forms/{form_id}",
        name: "Form Schema",
        description: "UFP form schema definition with field types, validation rules, and AI instructions",
        mimeType: "application/json"
      },
      {
        uri_template: "ufp://inputhaven.com/submissions/{submission_id}",
        name: "Submission",
        description: "Form submission data, status, and AI analysis results",
        mimeType: "application/json"
      },
      {
        uri_template: "ufp://inputhaven.com/types",
        name: "Semantic Types",
        description: "Registry of semantic field types (person.email, organization.name, etc.)",
        mimeType: "application/json"
      }
    ],
    
    prompts: [
      {
        name: "fill_form",
        description: "Interactive guide for filling out a form through conversation. Walks through each field with helpful prompts.",
        arguments: [
          {
            name: "form_id",
            description: "The form to fill out",
            required: true
          },
          {
            name: "known_data",
            description: "Any data already known about the user (name, email, etc.)",
            required: false
          }
        ]
      },
      {
        name: "analyze_submission",
        description: "Analyze a submission and provide insights",
        arguments: [
          {
            name: "submission_id",
            description: "The submission to analyze",
            required: true
          }
        ]
      }
    ],
    
    instructions: `
## How to Use InputHaven MCP

InputHaven implements the Universal Form Protocol (UFP), the standard for AI-native form handling.

### Workflow for Submitting Forms

1. **Find the form**: If you have a form ID, skip to step 2. Otherwise, use \`search_forms\` to find relevant forms.

2. **Get the schema**: ALWAYS call \`get_form_schema\` before submitting. This tells you:
   - Required fields and their types
   - Validation rules
   - Semantic types (e.g., person.email means an email address)
   - AI instructions for each field

3. **Validate (optional)**: Use \`validate_data\` to check your data before submitting.

4. **Submit**: Call \`submit_form\` with the form_id and properly formatted data.

5. **Confirm**: The response includes a submission_id. Use \`check_submission\` to verify status.

### Semantic Types

Fields use semantic types that help you understand what data is expected:
- \`person.full_name\` - A person's full name
- \`person.email\` - Email address
- \`person.phone\` - Phone number
- \`organization.name\` - Company/organization name
- \`content.message\` - Free-form message text
- \`meta.subject\` - Subject line or title

### Best Practices

- Always get the schema first
- Respect required vs optional fields
- Follow the format hints in the schema
- Include on_behalf_of when acting for a user
`
  })
})

// ==================== MCP TOOL EXECUTION ====================

app.post('/tools/:tool', async (c) => {
  const tool = c.req.param('tool')
  const body = await c.req.json()
  const args = body.arguments || body.params || body
  
  // Verify MCP session or API key
  const authHeader = c.req.header('Authorization')
  const mcpSession = c.req.header('X-MCP-Session')
  
  let authenticated = false
  let agentInfo: any = {}
  
  if (mcpSession) {
    const session = await prisma.mCPSession.findUnique({
      where: { sessionToken: mcpSession, isActive: true }
    })
    if (session && session.expiresAt > new Date()) {
      authenticated = true
      agentInfo = { sessionId: session.id, agentType: session.agentType }
      
      // Update session stats
      await prisma.mCPSession.update({
        where: { id: session.id },
        data: { 
          requestCount: { increment: 1 },
          lastRequestAt: new Date()
        }
      })
    }
  } else if (authHeader?.startsWith('Bearer ')) {
    const apiKey = authHeader.replace('Bearer ', '')
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
    
    const key = await prisma.apiKey.findUnique({
      where: { keyHash, isActive: true }
    })
    
    if (key) {
      authenticated = true
      agentInfo = { apiKeyId: key.id }
    }
  }
  
  if (!authenticated) {
    return c.json({
      content: [{
        type: "text",
        text: "Authentication required. Provide either X-MCP-Session header or Bearer token."
      }],
      isError: true
    }, 401)
  }
  
  // Route to appropriate handler
  switch (tool) {
    case 'submit_form':
      return handleSubmitForm(c, args, agentInfo)
    case 'get_form_schema':
      return handleGetFormSchema(c, args)
    case 'check_submission':
      return handleCheckSubmission(c, args)
    case 'search_forms':
      return handleSearchForms(c, args)
    case 'validate_data':
      return handleValidateData(c, args)
    default:
      return c.json({
        content: [{
          type: "text",
          text: `Unknown tool: ${tool}. Available tools: submit_form, get_form_schema, check_submission, search_forms, validate_data`
        }],
        isError: true
      }, 400)
  }
})

// ==================== TOOL HANDLERS ====================

async function handleSubmitForm(c: any, args: any, agentInfo: any) {
  const { form_id, data, on_behalf_of, metadata } = args
  
  if (!form_id || !data) {
    return c.json({
      content: [{
        type: "text",
        text: "Missing required parameters: form_id and data are required."
      }],
      isError: true
    })
  }
  
  // Resolve form ID (handle UFP URI, ID, or access key)
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
      mcpEnabled: true
    }
  })
  
  if (!form) {
    return c.json({
      content: [{
        type: "text",
        text: `Form not found: ${form_id}. The form may not exist, be inactive, or not have MCP enabled. Use search_forms to find available forms.`
      }],
      isError: true
    })
  }
  
  // Validate data against schema if available
  const validationErrors = validateAgainstSchema(data, form.schema as any)
  if (validationErrors.length > 0) {
    return c.json({
      content: [{
        type: "text",
        text: JSON.stringify({
          error: "Validation failed",
          errors: validationErrors,
          hint: "Use get_form_schema to see the correct field format"
        }, null, 2)
      }],
      isError: true
    })
  }
  
  // Create submission
  const submission = await prisma.submission.create({
    data: {
      formId: form.id,
      data,
      metadata: {
        source: 'mcp',
        agent: agentInfo.agentType || 'unknown',
        onBehalfOf: on_behalf_of,
        sessionId: agentInfo.sessionId,
        custom: metadata,
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
  
  // Return success response in MCP format
  return c.json({
    content: [{
      type: "text",
      text: JSON.stringify({
        success: true,
        message: form.successMessage || "Form submitted successfully",
        submission: {
          id: submission.id,
          form_id: form.id,
          form_name: form.name,
          status: "received",
          created_at: submission.createdAt
        },
        next_steps: [
          "The form owner will receive your submission",
          "Use check_submission with the submission id to verify status",
          on_behalf_of ? `Submitted on behalf of: ${on_behalf_of}` : null
        ].filter(Boolean)
      }, null, 2)
    }]
  })
}

async function handleGetFormSchema(c: any, args: any) {
  const { form_id } = args
  
  if (!form_id) {
    return c.json({
      content: [{
        type: "text",
        text: "Missing required parameter: form_id"
      }],
      isError: true
    })
  }
  
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
      isActive: true
    },
    select: {
      id: true,
      name: true,
      description: true,
      schema: true,
      ufpSchema: true,
      semanticTypes: true,
      aiInstructions: true,
      successMessage: true,
      mcpEnabled: true,
      mcpCapabilities: true
    }
  })
  
  if (!form) {
    return c.json({
      content: [{
        type: "text",
        text: `Form not found: ${form_id}. Use search_forms to find available forms.`
      }],
      isError: true
    })
  }
  
  // Build comprehensive schema response
  const schema = form.ufpSchema || form.schema || {}
  const semanticTypes = form.semanticTypes || {}
  const aiInstructions = form.aiInstructions || {}
  
  return c.json({
    content: [{
      type: "text",
      text: JSON.stringify({
        form_id: form.id,
        ufp_uri: `ufp://inputhaven.com/forms/${form.id}`,
        name: form.name,
        description: form.description,
        mcp_enabled: form.mcpEnabled,
        
        schema: schema,
        semantic_types: semanticTypes,
        
        ai_instructions: {
          when_to_use: (aiInstructions as any).when_to_use || `Use this form for: ${form.description || form.name}`,
          how_to_fill: (aiInstructions as any).how_to_fill || {},
          before_submit: (aiInstructions as any).before_submit || ["Verify all required fields are filled", "Confirm data with user if acting on their behalf"],
          after_submit: (aiInstructions as any).after_submit || ["Inform user of successful submission", "Provide submission ID for reference"]
        },
        
        usage_example: {
          tool: "submit_form",
          arguments: {
            form_id: form.id,
            data: generateExampleData(schema),
            on_behalf_of: "User Name (optional)"
          }
        }
      }, null, 2)
    }]
  })
}

async function handleCheckSubmission(c: any, args: any) {
  const { submission_id } = args
  
  if (!submission_id) {
    return c.json({
      content: [{
        type: "text",
        text: "Missing required parameter: submission_id"
      }],
      isError: true
    })
  }
  
  const submission = await prisma.submission.findUnique({
    where: { id: submission_id },
    include: {
      form: {
        select: { name: true, id: true }
      }
    }
  })
  
  if (!submission) {
    return c.json({
      content: [{
        type: "text",
        text: `Submission not found: ${submission_id}`
      }],
      isError: true
    })
  }
  
  return c.json({
    content: [{
      type: "text",
      text: JSON.stringify({
        submission_id: submission.id,
        form: {
          id: submission.form.id,
          name: submission.form.name
        },
        status: submission.isSpam ? "spam" : (submission.isRead ? "read" : "received"),
        submitted_at: submission.createdAt,
        is_read: submission.isRead,
        is_starred: submission.isStarred,
        
        ai_analysis: {
          sentiment: submission.sentiment,
          tags: submission.tags,
          summary: submission.summary,
          spam_score: submission.spamScore
        }
      }, null, 2)
    }]
  })
}

async function handleSearchForms(c: any, args: any) {
  const { query, category, limit = 10 } = args
  
  // Build search query
  const where: any = {
    isActive: true,
    mcpEnabled: true
  }
  
  // Only return forms with public listings or that are explicitly public
  const forms = await prisma.form.findMany({
    where,
    include: {
      publicListing: true
    },
    take: Math.min(limit, 50)
  })
  
  // Filter by query and category
  let results = forms
  
  if (query) {
    const q = query.toLowerCase()
    results = results.filter(f => 
      f.name.toLowerCase().includes(q) ||
      f.description?.toLowerCase().includes(q) ||
      f.publicListing?.tags?.some((t: string) => t.toLowerCase().includes(q))
    )
  }
  
  if (category) {
    results = results.filter(f => 
      f.publicListing?.category?.toLowerCase() === category.toLowerCase()
    )
  }
  
  if (results.length === 0) {
    return c.json({
      content: [{
        type: "text",
        text: JSON.stringify({
          message: "No forms found matching your criteria",
          suggestions: [
            "Try a broader search query",
            "Check available categories: contact, support, feedback, lead-gen, registration, survey",
            "Contact the organization directly if you have their form ID"
          ]
        }, null, 2)
      }]
    })
  }
  
  return c.json({
    content: [{
      type: "text",
      text: JSON.stringify({
        results: results.map(f => ({
          form_id: f.id,
          ufp_uri: f.ufpUri || `ufp://inputhaven.com/forms/${f.id}`,
          name: f.name,
          description: f.description,
          category: f.publicListing?.category,
          tags: f.publicListing?.tags || []
        })),
        
        usage: "Use get_form_schema with a form_id to see required fields, then submit_form to submit data"
      }, null, 2)
    }]
  })
}

async function handleValidateData(c: any, args: any) {
  const { form_id, data } = args
  
  if (!form_id || !data) {
    return c.json({
      content: [{
        type: "text",
        text: "Missing required parameters: form_id and data are required"
      }],
      isError: true
    })
  }
  
  const formIdentifier = form_id
    .replace('ufp://inputhaven.com/forms/', '')
    .replace('ufp://inputhaven.com/f/', '')
  
  const form = await prisma.form.findFirst({
    where: {
      OR: [
        { id: formIdentifier },
        { accessKey: formIdentifier }
      ]
    },
    select: { schema: true, ufpSchema: true }
  })
  
  if (!form) {
    return c.json({
      content: [{
        type: "text",
        text: `Form not found: ${form_id}`
      }],
      isError: true
    })
  }
  
  const errors = validateAgainstSchema(data, (form.ufpSchema || form.schema) as any)
  
  if (errors.length === 0) {
    return c.json({
      content: [{
        type: "text",
        text: JSON.stringify({
          valid: true,
          message: "Data is valid. You can proceed with submit_form."
        }, null, 2)
      }]
    })
  }
  
  return c.json({
    content: [{
      type: "text",
      text: JSON.stringify({
        valid: false,
        errors: errors,
        hint: "Fix the errors above and try again"
      }, null, 2)
    }]
  })
}

// ==================== MCP RESOURCES ====================

app.get('/resources', async (c) => {
  return c.json({
    resources: [
      {
        uri: "ufp://inputhaven.com/types",
        name: "Semantic Type Registry",
        description: "All available semantic types for form fields",
        mimeType: "application/json"
      }
    ]
  })
})

app.get('/resources/*', async (c) => {
  const uri = c.req.path.replace('/mcp/v1/resources/', '')
  
  // Handle semantic types registry
  if (uri === 'ufp://inputhaven.com/types' || uri === 'types') {
    const types = await prisma.semanticType.findMany({
      orderBy: [{ namespace: 'asc' }, { name: 'asc' }]
    })
    
    // Group by namespace
    const grouped = types.reduce((acc: any, t) => {
      if (!acc[t.namespace]) acc[t.namespace] = []
      acc[t.namespace].push({
        name: t.name,
        fullPath: t.fullPath,
        description: t.description,
        examples: t.examples,
        validation: t.validation,
        jsonSchemaType: t.jsonSchemaType
      })
      return acc
    }, {})
    
    return c.json({
      contents: [{
        uri: "ufp://inputhaven.com/types",
        mimeType: "application/json",
        text: JSON.stringify(grouped, null, 2)
      }]
    })
  }
  
  // Handle form schema resources
  if (uri.startsWith('ufp://inputhaven.com/forms/')) {
    const formId = uri.replace('ufp://inputhaven.com/forms/', '')
    const form = await prisma.form.findFirst({
      where: {
        OR: [
          { id: formId },
          { accessKey: formId }
        ]
      }
    })
    
    if (form) {
      return c.json({
        contents: [{
          uri: uri,
          mimeType: "application/json",
          text: JSON.stringify({
            id: form.id,
            name: form.name,
            schema: form.ufpSchema || form.schema
          }, null, 2)
        }]
      })
    }
  }
  
  return c.json({ error: "Resource not found" }, 404)
})

// ==================== MCP PROMPTS ====================

app.get('/prompts', async (c) => {
  return c.json({
    prompts: [
      {
        name: "fill_form",
        description: "Interactive form filling guide",
        arguments: [
          { name: "form_id", required: true },
          { name: "known_data", required: false }
        ]
      }
    ]
  })
})

app.post('/prompts/:name', async (c) => {
  const name = c.req.param('name')
  const { arguments: args } = await c.req.json()
  
  if (name === 'fill_form') {
    const formId = args.form_id
    const knownData = args.known_data || {}
    
    const form = await prisma.form.findFirst({
      where: {
        OR: [
          { id: formId },
          { accessKey: formId }
        ]
      }
    })
    
    if (!form) {
      return c.json({
        messages: [{
          role: "user",
          content: { type: "text", text: `Form not found: ${formId}` }
        }]
      })
    }
    
    const schema = (form.ufpSchema || form.schema) as any
    const fields = schema?.fields || schema?.properties || {}
    
    let prompt = `I'll help you fill out the "${form.name}" form.\n\n`
    prompt += form.description ? `${form.description}\n\n` : ''
    prompt += "Let me walk through each field:\n\n"
    
    for (const [key, field] of Object.entries(fields)) {
      const f = field as any
      const known = knownData[key]
      if (known) {
        prompt += `✓ ${f.title || key}: ${known} (already provided)\n`
      } else {
        prompt += `• ${f.title || key}${f.required ? ' (required)' : ''}: ${f.description || ''}\n`
      }
    }
    
    prompt += "\nPlease provide the missing information, and I'll submit the form for you."
    
    return c.json({
      messages: [{
        role: "user",
        content: { type: "text", text: prompt }
      }]
    })
  }
  
  return c.json({ error: "Prompt not found" }, 404)
})

// ==================== MCP SESSION MANAGEMENT ====================

app.post('/sessions', async (c) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'API key required in Authorization header' }, 401)
  }
  
  const apiKey = authHeader.replace('Bearer ', '')
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
  
  const key = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { user: true }
  })
  
  if (!key || !key.isActive) {
    return c.json({ error: 'Invalid API key' }, 401)
  }
  
  // Create session token
  const sessionToken = `mcp_${crypto.randomBytes(32).toString('hex')}`
  
  const session = await prisma.mCPSession.create({
    data: {
      sessionToken,
      apiKeyId: key.id,
      agentType: c.req.header('X-MCP-Agent') || c.req.header('User-Agent') || 'unknown',
      agentId: c.req.header('X-MCP-Agent-Id'),
      capabilities: ['submit', 'query', 'validate'],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }
  })
  
  return c.json({
    session_token: sessionToken,
    expires_at: session.expiresAt,
    capabilities: session.capabilities,
    usage: {
      header: "X-MCP-Session",
      value: sessionToken
    }
  })
})

app.delete('/sessions/:token', async (c) => {
  const token = c.req.param('token')
  
  await prisma.mCPSession.updateMany({
    where: { sessionToken: token },
    data: { isActive: false }
  })
  
  return c.json({ success: true, message: 'Session invalidated' })
})

// ==================== HELPER FUNCTIONS ====================

function validateAgainstSchema(data: any, schema: any): string[] {
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
  
  // Check field types and validation
  for (const [key, value] of Object.entries(data)) {
    const fieldSchema = fields[key]
    if (!fieldSchema) continue
    
    const f = fieldSchema as any
    
    // Type validation
    if (f.type === 'string' && typeof value !== 'string') {
      errors.push(`Field ${key} must be a string`)
    }
    if (f.type === 'number' && typeof value !== 'number') {
      errors.push(`Field ${key} must be a number`)
    }
    if (f.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`Field ${key} must be a boolean`)
    }
    
    // Format validation
    if (f.format === 'email' && typeof value === 'string') {
      if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors.push(`Field ${key} must be a valid email address`)
      }
    }
    if (f.format === 'uri' && typeof value === 'string') {
      try {
        new URL(value)
      } catch {
        errors.push(`Field ${key} must be a valid URL`)
      }
    }
    
    // Length validation
    if (f.minLength && typeof value === 'string' && value.length < f.minLength) {
      errors.push(`Field ${key} must be at least ${f.minLength} characters`)
    }
    if (f.maxLength && typeof value === 'string' && value.length > f.maxLength) {
      errors.push(`Field ${key} must be at most ${f.maxLength} characters`)
    }
  }
  
  return errors
}

function generateExampleData(schema: any): any {
  const example: any = {}
  const fields = schema?.fields || schema?.properties || {}
  
  for (const [key, field] of Object.entries(fields)) {
    const f = field as any
    
    if (f.example) {
      example[key] = f.example
    } else if (f.type === 'string') {
      if (f.format === 'email') example[key] = 'user@example.com'
      else if (f.format === 'uri') example[key] = 'https://example.com'
      else example[key] = `Example ${f.title || key}`
    } else if (f.type === 'number') {
      example[key] = 0
    } else if (f.type === 'boolean') {
      example[key] = true
    }
  }
  
  return example
}

export { app as mcpRoutes }
