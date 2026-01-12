import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ==================== SEMANTIC TYPES ====================
const semanticTypes = [
  // Person namespace
  { namespace: 'person', name: 'full_name', fullPath: 'person.full_name', description: 'Full name of a person', examples: ['John Smith', 'Maria Garcia'], jsonSchemaType: 'string', schemaOrgType: 'name' },
  { namespace: 'person', name: 'first_name', fullPath: 'person.first_name', description: 'First/given name', examples: ['John', 'Maria'], jsonSchemaType: 'string', schemaOrgType: 'givenName' },
  { namespace: 'person', name: 'last_name', fullPath: 'person.last_name', description: 'Last/family name', examples: ['Smith', 'Garcia'], jsonSchemaType: 'string', schemaOrgType: 'familyName' },
  { namespace: 'person', name: 'email', fullPath: 'person.email', description: 'Email address', examples: ['user@example.com'], jsonSchemaType: 'string', schemaOrgType: 'email', openApiFormat: 'email' },
  { namespace: 'person', name: 'phone', fullPath: 'person.phone', description: 'Phone number', examples: ['+1-555-123-4567', '(555) 123-4567'], jsonSchemaType: 'string', schemaOrgType: 'telephone' },
  { namespace: 'person', name: 'job_title', fullPath: 'person.job_title', description: 'Job title or role', examples: ['Software Engineer', 'CEO'], jsonSchemaType: 'string', schemaOrgType: 'jobTitle' },
  
  // Organization namespace
  { namespace: 'organization', name: 'name', fullPath: 'organization.name', description: 'Company or organization name', examples: ['Acme Corp', 'Tech Startup Inc'], jsonSchemaType: 'string', schemaOrgType: 'name' },
  { namespace: 'organization', name: 'website', fullPath: 'organization.website', description: 'Company website URL', examples: ['https://example.com'], jsonSchemaType: 'string', schemaOrgType: 'url', openApiFormat: 'uri' },
  { namespace: 'organization', name: 'industry', fullPath: 'organization.industry', description: 'Industry or sector', examples: ['Technology', 'Healthcare', 'Finance'], jsonSchemaType: 'string' },
  { namespace: 'organization', name: 'size', fullPath: 'organization.size', description: 'Company size range', examples: ['1-10', '11-50', '51-200', '201-500', '500+'], jsonSchemaType: 'string' },
  
  // Location namespace
  { namespace: 'location', name: 'address', fullPath: 'location.address', description: 'Full street address', examples: ['123 Main St, Suite 100'], jsonSchemaType: 'string', schemaOrgType: 'streetAddress' },
  { namespace: 'location', name: 'city', fullPath: 'location.city', description: 'City name', examples: ['San Francisco', 'New York'], jsonSchemaType: 'string', schemaOrgType: 'addressLocality' },
  { namespace: 'location', name: 'state', fullPath: 'location.state', description: 'State or province', examples: ['California', 'NY', 'Ontario'], jsonSchemaType: 'string', schemaOrgType: 'addressRegion' },
  { namespace: 'location', name: 'country', fullPath: 'location.country', description: 'Country name or code', examples: ['United States', 'US', 'Canada'], jsonSchemaType: 'string', schemaOrgType: 'addressCountry' },
  { namespace: 'location', name: 'postal_code', fullPath: 'location.postal_code', description: 'ZIP or postal code', examples: ['94102', 'M5V 2H1'], jsonSchemaType: 'string', schemaOrgType: 'postalCode' },
  
  // Content namespace
  { namespace: 'content', name: 'subject', fullPath: 'content.subject', description: 'Subject line or title', examples: ['Question about pricing', 'Feature request'], jsonSchemaType: 'string' },
  { namespace: 'content', name: 'message', fullPath: 'content.message', description: 'Main message or body text', examples: ['I would like to inquire about...'], jsonSchemaType: 'string' },
  { namespace: 'content', name: 'description', fullPath: 'content.description', description: 'Detailed description', examples: ['A comprehensive overview of...'], jsonSchemaType: 'string' },
  { namespace: 'content', name: 'feedback', fullPath: 'content.feedback', description: 'Feedback or review text', examples: ['Great product! I love the...'], jsonSchemaType: 'string' },
  { namespace: 'content', name: 'comment', fullPath: 'content.comment', description: 'Comment or note', examples: ['Additional context...'], jsonSchemaType: 'string' },
  
  // Meta namespace
  { namespace: 'meta', name: 'category', fullPath: 'meta.category', description: 'Category selection', examples: ['support', 'sales', 'feedback'], jsonSchemaType: 'string' },
  { namespace: 'meta', name: 'priority', fullPath: 'meta.priority', description: 'Priority level', examples: ['low', 'medium', 'high', 'urgent'], jsonSchemaType: 'string' },
  { namespace: 'meta', name: 'rating', fullPath: 'meta.rating', description: 'Numeric rating', examples: ['1', '5', '10'], jsonSchemaType: 'integer' },
  { namespace: 'meta', name: 'consent', fullPath: 'meta.consent', description: 'Consent checkbox', examples: ['true', 'false'], jsonSchemaType: 'boolean' },
  { namespace: 'meta', name: 'date', fullPath: 'meta.date', description: 'Date value', examples: ['2024-01-15', '01/15/2024'], jsonSchemaType: 'string', openApiFormat: 'date' },
  { namespace: 'meta', name: 'tags', fullPath: 'meta.tags', description: 'Tags or keywords', examples: ['bug, urgent, api'], jsonSchemaType: 'array' },
  
  // Financial namespace
  { namespace: 'financial', name: 'budget', fullPath: 'financial.budget', description: 'Budget amount or range', examples: ['$1000-$5000', '10000'], jsonSchemaType: 'string' },
  { namespace: 'financial', name: 'currency', fullPath: 'financial.currency', description: 'Currency code', examples: ['USD', 'EUR', 'GBP'], jsonSchemaType: 'string' },
  
  // Product namespace
  { namespace: 'product', name: 'name', fullPath: 'product.name', description: 'Product or service name', examples: ['Pro Plan', 'Enterprise'], jsonSchemaType: 'string' },
  { namespace: 'product', name: 'sku', fullPath: 'product.sku', description: 'Product SKU or ID', examples: ['PROD-001', 'SKU12345'], jsonSchemaType: 'string' },
  { namespace: 'product', name: 'quantity', fullPath: 'product.quantity', description: 'Quantity amount', examples: ['1', '10', '100'], jsonSchemaType: 'integer' },
]

// ==================== SYSTEM TEMPLATES ====================
const systemTemplates = [
  // Contact Form Templates
  {
    name: 'Basic Contact Form',
    slug: 'contact-basic',
    type: 'FORM_SCHEMA',
    category: 'contact',
    description: 'Simple contact form with name, email, and message',
    isSystem: true,
    isPublic: true,
    schema: {
      fields: {
        name: { type: 'string', title: 'Name', required: true, semanticType: 'person.full_name' },
        email: { type: 'string', title: 'Email', required: true, format: 'email', semanticType: 'person.email' },
        message: { type: 'string', title: 'Message', required: true, semanticType: 'content.message' }
      },
      required: ['name', 'email', 'message']
    },
    aiInstructions: {
      when_to_use: 'Use when someone wants to contact a business or send a general inquiry',
      how_to_fill: {
        name: 'Full name of the person sending the message',
        email: 'Email address for replies',
        message: 'The main inquiry or message content'
      }
    }
  },
  {
    name: 'Sales Inquiry Form',
    slug: 'sales-inquiry',
    type: 'FORM_SCHEMA',
    category: 'contact',
    description: 'Sales inquiry with company info and budget',
    isSystem: true,
    isPublic: true,
    schema: {
      fields: {
        name: { type: 'string', title: 'Name', required: true, semanticType: 'person.full_name' },
        email: { type: 'string', title: 'Email', required: true, format: 'email', semanticType: 'person.email' },
        company: { type: 'string', title: 'Company', required: true, semanticType: 'organization.name' },
        company_size: { type: 'string', title: 'Company Size', enum: ['1-10', '11-50', '51-200', '201-500', '500+'], semanticType: 'organization.size' },
        budget: { type: 'string', title: 'Budget Range', enum: ['<$1k', '$1k-$5k', '$5k-$10k', '$10k-$50k', '$50k+'], semanticType: 'financial.budget' },
        message: { type: 'string', title: 'How can we help?', required: true, semanticType: 'content.message' }
      },
      required: ['name', 'email', 'company', 'message']
    },
    aiInstructions: {
      when_to_use: 'Use when someone is interested in purchasing a product or service',
      classification_hint: 'This is a sales lead - prioritize based on company size and budget'
    }
  },
  
  // Support Form Templates
  {
    name: 'Bug Report Form',
    slug: 'bug-report',
    type: 'FORM_SCHEMA',
    category: 'support',
    description: 'Technical bug report with steps to reproduce',
    isSystem: true,
    isPublic: true,
    schema: {
      fields: {
        email: { type: 'string', title: 'Email', required: true, format: 'email', semanticType: 'person.email' },
        subject: { type: 'string', title: 'Bug Title', required: true, semanticType: 'content.subject' },
        severity: { type: 'string', title: 'Severity', required: true, enum: ['low', 'medium', 'high', 'critical'], semanticType: 'meta.priority' },
        steps: { type: 'string', title: 'Steps to Reproduce', required: true, semanticType: 'content.description' },
        expected: { type: 'string', title: 'Expected Behavior', semanticType: 'content.description' },
        actual: { type: 'string', title: 'Actual Behavior', required: true, semanticType: 'content.description' },
        browser: { type: 'string', title: 'Browser/Environment' }
      },
      required: ['email', 'subject', 'severity', 'steps', 'actual']
    },
    aiInstructions: {
      when_to_use: 'Use when reporting a software bug or technical issue',
      classification_hint: 'Route critical bugs immediately to engineering',
      extract_entities: ['product', 'version', 'browser']
    }
  },
  {
    name: 'Feature Request Form',
    slug: 'feature-request',
    type: 'FORM_SCHEMA',
    category: 'support',
    description: 'Product feature request form',
    isSystem: true,
    isPublic: true,
    schema: {
      fields: {
        email: { type: 'string', title: 'Email', required: true, format: 'email', semanticType: 'person.email' },
        feature_title: { type: 'string', title: 'Feature Title', required: true, semanticType: 'content.subject' },
        description: { type: 'string', title: 'Describe the Feature', required: true, semanticType: 'content.description' },
        use_case: { type: 'string', title: 'Use Case', required: true, semanticType: 'content.description' },
        priority: { type: 'string', title: 'Priority for You', enum: ['nice-to-have', 'important', 'critical'], semanticType: 'meta.priority' }
      },
      required: ['email', 'feature_title', 'description', 'use_case']
    }
  },
  
  // Feedback Form Templates
  {
    name: 'NPS Survey',
    slug: 'nps-survey',
    type: 'FORM_SCHEMA',
    category: 'feedback',
    description: 'Net Promoter Score survey',
    isSystem: true,
    isPublic: true,
    schema: {
      fields: {
        score: { type: 'integer', title: 'How likely are you to recommend us? (0-10)', required: true, minimum: 0, maximum: 10, semanticType: 'meta.rating' },
        reason: { type: 'string', title: 'What is the primary reason for your score?', semanticType: 'content.feedback' },
        improve: { type: 'string', title: 'How can we improve?', semanticType: 'content.feedback' }
      },
      required: ['score']
    },
    aiInstructions: {
      when_to_use: 'Use for NPS surveys to measure customer satisfaction',
      classification: {
        'score >= 9': 'promoter',
        'score >= 7': 'passive',
        'score < 7': 'detractor'
      }
    }
  },
  
  // Lead Gen Templates
  {
    name: 'Newsletter Signup',
    slug: 'newsletter-signup',
    type: 'FORM_SCHEMA',
    category: 'lead-gen',
    description: 'Simple email newsletter signup',
    isSystem: true,
    isPublic: true,
    schema: {
      fields: {
        email: { type: 'string', title: 'Email Address', required: true, format: 'email', semanticType: 'person.email' },
        name: { type: 'string', title: 'Name (optional)', semanticType: 'person.full_name' },
        consent: { type: 'boolean', title: 'I agree to receive marketing emails', required: true, semanticType: 'meta.consent' }
      },
      required: ['email', 'consent']
    }
  },
  {
    name: 'Demo Request',
    slug: 'demo-request',
    type: 'FORM_SCHEMA',
    category: 'lead-gen',
    description: 'Request a product demo',
    isSystem: true,
    isPublic: true,
    schema: {
      fields: {
        name: { type: 'string', title: 'Name', required: true, semanticType: 'person.full_name' },
        email: { type: 'string', title: 'Work Email', required: true, format: 'email', semanticType: 'person.email' },
        phone: { type: 'string', title: 'Phone', semanticType: 'person.phone' },
        company: { type: 'string', title: 'Company', required: true, semanticType: 'organization.name' },
        job_title: { type: 'string', title: 'Job Title', semanticType: 'person.job_title' },
        company_size: { type: 'string', title: 'Company Size', enum: ['1-10', '11-50', '51-200', '201-500', '500+'], semanticType: 'organization.size' },
        interests: { type: 'string', title: 'What are you most interested in?', semanticType: 'content.message' }
      },
      required: ['name', 'email', 'company']
    },
    aiInstructions: {
      when_to_use: 'Use when booking a product demo or sales call',
      classification_hint: 'High-intent sales lead - route to sales team',
      auto_respond: true
    }
  },
  
  // Email Templates
  {
    name: 'Submission Received',
    slug: 'email-submission-received',
    type: 'EMAIL_NOTIFICATION',
    category: 'email',
    description: 'Notification when a form submission is received',
    isSystem: true,
    isPublic: true,
    subject: 'New submission: {{_form.name}}',
    body: `You have received a new submission from {{name}} ({{email}}).

Summary: {{_ai.summary}}
Sentiment: {{_ai.sentiment}}
Classification: {{_ai.classification}}

View the full submission in your InputHaven dashboard.`,
    schema: {}
  },
  {
    name: 'Auto-Response Thank You',
    slug: 'auto-response-thankyou',
    type: 'AUTO_RESPONSE',
    category: 'email',
    description: 'Automatic thank you email to form submitters',
    isSystem: true,
    isPublic: true,
    subject: 'Thank you for contacting us',
    body: `Hi {{name}},

Thank you for reaching out to us. We've received your message and will get back to you shortly.

For your reference, here's a summary of your submission:
{{_ai.summary}}

Best regards,
The Team`,
    schema: {}
  }
]

async function seed() {
  console.log('🌱 Starting database seed...')
  
  // Seed semantic types
  console.log('📝 Seeding semantic types...')
  for (const type of semanticTypes) {
    await prisma.semanticType.upsert({
      where: { fullPath: type.fullPath },
      update: type,
      create: {
        ...type,
        isSystem: true,
        formats: [],
        aiExamples: type.examples
      }
    })
  }
  console.log(`   ✅ Seeded ${semanticTypes.length} semantic types`)
  
  // Create system workspace for templates
  let systemWorkspace = await prisma.workspace.findFirst({
    where: { slug: 'inputhaven-system' }
  })
  
  if (!systemWorkspace) {
    // Find or create system user
    let systemUser = await prisma.user.findFirst({
      where: { email: 'system@inputhaven.com' }
    })
    
    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          email: 'system@inputhaven.com',
          name: 'InputHaven System',
          passwordHash: 'SYSTEM_USER_NO_LOGIN',
          emailVerified:  new Date() 
        }
      })
    }
    
    systemWorkspace = await prisma.workspace.create({
      data: {
        name: 'InputHaven System',
        slug: 'inputhaven-system',
        ownerId: systemUser.id,
        members: {
          create: {
            userId: systemUser.id,
            role: 'OWNER'
          }
        }
      }
    })
  }
  
  // Seed system templates
  console.log('📋 Seeding system templates...')
  for (const template of systemTemplates) {
    await prisma.template.upsert({
      where: {
        workspaceId_slug: {
          workspaceId: systemWorkspace.id,
          slug: template.slug
        }
      },
      update: {
        name: template.name,
        description: template.description,
        schema: template.schema,
        aiInstructions: template.aiInstructions || null,
        subject: template.subject || null,
        body: template.body || null
      },
      create: {
        ...template,
        workspaceId: systemWorkspace.id,
        ufpVersion: '1.0',
        aiEnabled: true,
        mcpEnabled: true
      }
    })
  }
  console.log(`   ✅ Seeded ${systemTemplates.length} system templates`)
  
  console.log('')
  console.log('🎉 Database seed completed!')
  console.log('')
  console.log('You can now:')
  console.log('  • View semantic types at /v1/ufp/types')
  console.log('  • Browse templates at /v1/templates?includeSystem=true')
  console.log('  • Access MCP manifest at /mcp/v1/manifest')
}

seed()
  .catch((error) => {
    console.error('❌ Seed error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
