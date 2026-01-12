// AI Processor Service
// Handles all AI-powered features: classification, sentiment, extraction, auto-responses

import { prisma } from '../lib/prisma.js'

// Use dynamic import for Anthropic to handle missing API key gracefully
let anthropicClient: any = null

async function getAnthropicClient() {
  if (!anthropicClient && process.env.ANTHROPIC_API_KEY) {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })
  }
  return anthropicClient
}

export interface ProcessingResult {
  classification?: string
  sentiment?: string
  urgency?: number
  summary?: string
  entities?: Record<string, any>
  tags?: string[]
  suggestedResponse?: string
  routing?: string
  customOutput?: Record<string, any>
  processingTime?: number
}

export interface ProcessorConfig {
  provider?: 'anthropic' | 'openai'
  model?: string
  temperature?: number
  maxTokens?: number
}

// ==================== MAIN PROCESSING FUNCTION ====================

export async function processSubmission(
  submissionId: string,
  formId: string
): Promise<ProcessingResult> {
  const startTime = Date.now()
  
  // Get form and submission
  const [form, submission] = await Promise.all([
    prisma.form.findUnique({
      where: { id: formId },
      include: {
        aiProcessors: {
          where: { isActive: true, trigger: 'ON_SUBMISSION' },
          orderBy: { order: 'asc' }
        }
      }
    }),
    prisma.submission.findUnique({ where: { id: submissionId } })
  ])
  
  if (!form || !submission || !form.aiEnabled) {
    return {}
  }
  
  const data = submission.data as Record<string, any>
  const result: ProcessingResult = {}
  
  try {
    // Run default processors in parallel if enabled
    const defaultTasks: Promise<void>[] = []
    
    if (form.aiClassify) {
      defaultTasks.push(
        classifySubmission(data).then(r => { result.classification = r })
      )
    }
    
    if (form.aiSentiment) {
      defaultTasks.push(
        analyzeSentiment(data).then(r => { result.sentiment = r })
      )
    }
    
    if (form.aiSummarize) {
      defaultTasks.push(
        summarizeSubmission(data).then(r => { result.summary = r })
      )
    }
    
    if (form.aiExtractEntities) {
      defaultTasks.push(
        extractEntities(data).then(r => { result.entities = r })
      )
    }
    
    await Promise.all(defaultTasks)
    
    // Generate tags from classification and entities
    result.tags = generateTags(result)
    
    // Run custom processors sequentially (they may depend on previous results)
    for (const processor of form.aiProcessors) {
      try {
        const output = await runProcessor(processor, data, result)
        
        // Merge output based on type
        switch (processor.outputType) {
          case 'CLASSIFICATION':
            result.classification = output
            break
          case 'SENTIMENT':
            result.sentiment = output
            break
          case 'SUMMARY':
            result.summary = output
            break
          case 'TAGS':
            result.tags = [...(result.tags || []), ...(Array.isArray(output) ? output : [output])]
            break
          case 'RESPONSE':
            result.suggestedResponse = output
            break
          case 'ROUTING':
            result.routing = output
            break
          case 'SCORE':
            result.urgency = typeof output === 'number' ? output : parseFloat(output) || 0
            break
          case 'CUSTOM':
            result.customOutput = { 
              ...result.customOutput, 
              [processor.outputField || processor.name]: output 
            }
            break
        }
        
        // Update processor stats
        await prisma.aIProcessor.update({
          where: { id: processor.id },
          data: {
            executionCount: { increment: 1 }
          }
        })
      } catch (error) {
        console.error(`Processor ${processor.name} failed:`, error)
      }
    }
    
    // Determine routing based on rules
    if (form.aiRoutingRules && Array.isArray(form.aiRoutingRules) && (form.aiRoutingRules as any[]).length > 0) {
      result.routing = evaluateRoutingRules(form.aiRoutingRules as any[], result, data)
    }
    
    // Calculate processing time
    result.processingTime = Date.now() - startTime
    
    // Update submission with AI results
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        sentiment: result.sentiment,
        tags: result.tags || [],
        summary: result.summary,
        metadata: {
          ...(submission.metadata as any || {}),
          aiProcessing: {
            processedAt: new Date().toISOString(),
            durationMs: result.processingTime,
            classification: result.classification,
            entities: result.entities,
            urgency: result.urgency,
            routing: result.routing
          }
        }
      }
    })
    
    return result
  } catch (error) {
    console.error('AI processing error:', error)
    return { processingTime: Date.now() - startTime }
  }
}

// ==================== DEFAULT PROCESSORS ====================

async function classifySubmission(data: Record<string, any>): Promise<string> {
  const anthropic = await getAnthropicClient()
  if (!anthropic) return 'unclassified'
  
  const content = extractTextContent(data)
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: `Classify this form submission into ONE category. Only respond with the category name, nothing else.

Categories:
- inquiry: General questions or information requests
- support: Help requests, bug reports, technical issues
- feedback: Opinions, suggestions, reviews
- complaint: Negative experiences, issues, problems
- sales: Purchase intent, pricing questions, demos
- partnership: Business collaboration, affiliate requests
- job_application: Employment interest, resume submissions
- spam: Irrelevant, promotional, or malicious content
- other: Doesn't fit other categories

Submission:
${content.slice(0, 1500)}`
      }]
    })
    
    return (response.content[0] as any).text.trim().toLowerCase()
  } catch (error) {
    console.error('Classification error:', error)
    return 'unclassified'
  }
}

async function analyzeSentiment(data: Record<string, any>): Promise<string> {
  const anthropic = await getAnthropicClient()
  if (!anthropic) return 'neutral'
  
  const content = extractTextContent(data)
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 20,
      messages: [{
        role: 'user',
        content: `Analyze the emotional tone. Respond with only ONE word:
- positive: Happy, grateful, enthusiastic
- negative: Upset, disappointed, angry
- neutral: Factual, business-like, no strong emotion
- frustrated: Annoyed but not angry, impatient
- urgent: Time-sensitive, pressing need

Text:
${content.slice(0, 1000)}`
      }]
    })
    
    const result = (response.content[0] as any).text.trim().toLowerCase()
    return ['positive', 'negative', 'neutral', 'frustrated', 'urgent'].includes(result) 
      ? result 
      : 'neutral'
  } catch (error) {
    console.error('Sentiment analysis error:', error)
    return 'neutral'
  }
}

async function summarizeSubmission(data: Record<string, any>): Promise<string> {
  const anthropic = await getAnthropicClient()
  if (!anthropic) return ''
  
  const content = Object.entries(data)
    .filter(([k, v]) => typeof v === 'string' && !['access_key', '_gotcha', 'honeypot'].includes(k))
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
  
  if (!content.trim()) return ''
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Summarize this form submission in ONE concise sentence (max 100 characters). Focus on the main point or request.

${content.slice(0, 1500)}`
      }]
    })
    
    return (response.content[0] as any).text.trim().slice(0, 150)
  } catch (error) {
    console.error('Summarization error:', error)
    return ''
  }
}

async function extractEntities(data: Record<string, any>): Promise<Record<string, any>> {
  const anthropic = await getAnthropicClient()
  if (!anthropic) return {}
  
  const content = extractTextContent(data)
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Extract key entities from this text. Return ONLY valid JSON with these keys (omit keys with no values found):
- person: Names of people mentioned
- company: Company/organization names
- email: Email addresses
- phone: Phone numbers
- product: Product or service names
- date: Dates or times mentioned
- money: Monetary amounts
- location: Places, cities, countries
- url: Website URLs

Text:
${content.slice(0, 1500)}`
      }]
    })
    
    const text = (response.content[0] as any).text.trim()
    // Remove markdown code blocks if present
    const jsonText = text.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(jsonText)
  } catch (error) {
    console.error('Entity extraction error:', error)
    return {}
  }
}

// ==================== CUSTOM PROCESSOR EXECUTION ====================

async function runProcessor(
  processor: any,
  data: Record<string, any>,
  currentResults: ProcessingResult
): Promise<any> {
  const anthropic = await getAnthropicClient()
  if (!anthropic) {
    throw new Error('Anthropic client not available')
  }
  
  // Interpolate variables in prompts
  const context = {
    ...data,
    _ai: currentResults,
    _now: new Date().toISOString(),
    _date: new Date().toLocaleDateString(),
    _time: new Date().toLocaleTimeString()
  }
  
  const userPrompt = interpolateTemplate(processor.userPrompt, context)
  
  const response = await anthropic.messages.create({
    model: processor.model || 'claude-sonnet-4-20250514',
    max_tokens: processor.maxTokens || 1000,
    system: processor.systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  })
  
  const text = (response.content[0] as any).text.trim()
  
  // Parse if output schema expects JSON
  if (processor.outputSchema) {
    try {
      const jsonText = text.replace(/```json\n?|\n?```/g, '').trim()
      return JSON.parse(jsonText)
    } catch {
      return text
    }
  }
  
  return text
}

// ==================== AUTO-RESPONSE GENERATION ====================

export async function generateAutoResponse(
  submissionId: string,
  formId: string,
  aiResults: ProcessingResult
): Promise<string | null> {
  const anthropic = await getAnthropicClient()
  
  const [form, submission] = await Promise.all([
    prisma.form.findUnique({
      where: { id: formId },
      include: {
        templates: {
          where: { purpose: 'auto_response', isActive: true },
          include: { template: true }
        }
      }
    }),
    prisma.submission.findUnique({ where: { id: submissionId } })
  ])
  
  if (!form || !submission || !form.aiAutoRespond) {
    return null
  }
  
  const data = submission.data as Record<string, any>
  
  // Check if there's a custom auto-response template
  const responseTemplate = form.templates.find(t => t.purpose === 'auto_response')
  
  if (responseTemplate?.template.body) {
    // Use template with variable interpolation
    return interpolateTemplate(responseTemplate.template.body, {
      ...data,
      _ai: aiResults,
      _form: { name: form.name },
      _submission: { id: submissionId }
    })
  }
  
  // Generate response with AI
  if (!anthropic) return null
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: `You are a helpful customer service representative. Generate brief, professional auto-response emails. Be warm but concise. Do not make promises you can't keep. Maximum 3-4 sentences.`,
      messages: [{
        role: 'user',
        content: `Generate an auto-response for this ${aiResults.classification || 'form'} submission.

Name: ${data.name || data.full_name || 'Valued Customer'}
Email Subject/Type: ${aiResults.classification}
Sentiment: ${aiResults.sentiment}
Summary: ${aiResults.summary || 'Form submission received'}

Response should:
1. Acknowledge receipt
2. Set expectations for response time
3. Be appropriate for the sentiment (more empathetic if frustrated/negative)`
      }]
    })
    
    return (response.content[0] as any).text.trim()
  } catch (error) {
    console.error('Auto-response generation error:', error)
    return null
  }
}

// ==================== UTILITY FUNCTIONS ====================

function extractTextContent(data: Record<string, any>): string {
  return Object.values(data)
    .filter(v => typeof v === 'string')
    .join('\n')
}

function generateTags(result: ProcessingResult): string[] {
  const tags: string[] = []
  
  if (result.classification && result.classification !== 'other') {
    tags.push(result.classification)
  }
  
  if (result.sentiment && ['frustrated', 'urgent', 'negative'].includes(result.sentiment)) {
    tags.push(`sentiment:${result.sentiment}`)
  }
  
  if (result.entities) {
    if (result.entities.company) tags.push('has:company')
    if (result.entities.money) tags.push('has:budget')
    if (result.entities.date) tags.push('has:deadline')
  }
  
  return [...new Set(tags)] // Remove duplicates
}

function interpolateTemplate(template: string, vars: Record<string, any>): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path) => {
    const parts = path.split('.')
    let value: any = vars
    
    for (const part of parts) {
      value = value?.[part]
    }
    
    if (value === undefined || value === null) return ''
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  })
}

function evaluateRoutingRules(
  rules: Array<{ if: string; then: string }>,
  aiResults: ProcessingResult,
  data: Record<string, any>
): string {
  const context = { 
    ...data, 
    classification: aiResults.classification,
    sentiment: aiResults.sentiment,
    urgency: aiResults.urgency,
    hasCompany: !!aiResults.entities?.company,
    hasBudget: !!aiResults.entities?.money
  }
  
  for (const rule of rules) {
    if (evaluateCondition(rule.if, context)) {
      return rule.then
    }
  }
  
  return 'default'
}

function evaluateCondition(condition: string, context: Record<string, any>): boolean {
  try {
    // Simple safe expression evaluator
    // Supports: ==, !=, >, <, >=, <=, &&, ||, in
    
    // Replace variable references with their values
    let expr = condition
    
    // Handle "field in [values]" pattern
    expr = expr.replace(/(\w+)\s+in\s+\[([^\]]+)\]/g, (_, field, values) => {
      const fieldValue = context[field]
      const valueList = values.split(',').map((v: string) => v.trim().replace(/['"]/g, ''))
      return valueList.includes(fieldValue) ? 'true' : 'false'
    })
    
    // Replace remaining variables
    expr = expr.replace(/\b([a-zA-Z_]\w*)\b/g, (match) => {
      if (['true', 'false', 'null', 'undefined'].includes(match)) return match
      if (context.hasOwnProperty(match)) {
        const val = context[match]
        if (typeof val === 'string') return `"${val}"`
        if (val === null || val === undefined) return 'null'
        return String(val)
      }
      return 'null'
    })
    
    // Replace operators
    expr = expr.replace(/\s+AND\s+/gi, ' && ')
    expr = expr.replace(/\s+OR\s+/gi, ' || ')
    
    // Evaluate
    return new Function(`return ${expr}`)()
  } catch (error) {
    console.error('Condition evaluation error:', condition, error)
    return false
  }
}

// ==================== BATCH PROCESSING ====================

export async function processPendingSubmissions(limit: number = 50): Promise<number> {
  // Find submissions that haven't been AI-processed yet
  const submissions = await prisma.submission.findMany({
    where: {
      form: { aiEnabled: true },
      metadata: {
        path: ['aiProcessing'],
        equals: null
      }
    },
    include: {
      form: { select: { id: true, aiEnabled: true } }
    },
    take: limit,
    orderBy: { createdAt: 'asc' }
  })
  
  let processed = 0
  
  for (const submission of submissions) {
    try {
      await processSubmission(submission.id, submission.formId)
      processed++
    } catch (error) {
      console.error(`Failed to process submission ${submission.id}:`, error)
    }
  }
  
  return processed
}

// ==================== EXPORTS ====================

export {
  classifySubmission,
  analyzeSentiment,
  summarizeSubmission,
  extractEntities,
  interpolateTemplate
}
