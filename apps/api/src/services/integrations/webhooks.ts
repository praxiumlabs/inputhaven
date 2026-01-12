/**
 * Webhook Integration Connectors
 * 
 * Handles Zapier, n8n, Make (Integromat), and custom webhooks
 */

import type {
  ZapierConfig,
  N8nConfig,
  MakeConfig,
  WebhookConfig,
  IntegrationPayload,
  IntegrationResult,
  IntegrationType
} from './types.js'

// ==================== ZAPIER ====================

export async function sendToZapier(
  integrationId: string,
  config: ZapierConfig,
  payload: IntegrationPayload
): Promise<IntegrationResult> {
  return sendWebhook(integrationId, 'zapier', config.webhookUrl, payload, {
    includeMetadata: config.includeMetadata ?? true
  })
}

// ==================== N8N ====================

export async function sendToN8n(
  integrationId: string,
  config: N8nConfig,
  payload: IntegrationPayload
): Promise<IntegrationResult> {
  const headers: Record<string, string> = {}
  
  if (config.authHeader && config.authValue) {
    headers[config.authHeader] = config.authValue
  }

  return sendWebhook(integrationId, 'n8n', config.webhookUrl, payload, {
    includeMetadata: config.includeMetadata ?? true,
    headers
  })
}

// ==================== MAKE (INTEGROMAT) ====================

export async function sendToMake(
  integrationId: string,
  config: MakeConfig,
  payload: IntegrationPayload
): Promise<IntegrationResult> {
  return sendWebhook(integrationId, 'make', config.webhookUrl, payload, {
    includeMetadata: config.includeMetadata ?? true
  })
}

// ==================== CUSTOM WEBHOOK ====================

export async function sendToWebhook(
  integrationId: string,
  config: WebhookConfig,
  payload: IntegrationPayload
): Promise<IntegrationResult> {
  const startTime = Date.now()

  try {
    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'InputHaven-Webhook/2.0',
      ...(config.headers || {})
    }

    // Add authentication
    if (config.authType && config.authCredentials) {
      switch (config.authType) {
        case 'basic':
          if (config.authCredentials.username && config.authCredentials.password) {
            const credentials = Buffer.from(
              `${config.authCredentials.username}:${config.authCredentials.password}`
            ).toString('base64')
            headers['Authorization'] = `Basic ${credentials}`
          }
          break
        
        case 'bearer':
          if (config.authCredentials.token) {
            headers['Authorization'] = `Bearer ${config.authCredentials.token}`
          }
          break
        
        case 'api_key':
          if (config.authCredentials.headerName && config.authCredentials.apiKey) {
            headers[config.authCredentials.headerName] = config.authCredentials.apiKey
          }
          break
      }
    }

    // Build request body
    const body = buildWebhookPayload(config, payload)

    const response = await fetch(config.url, {
      method: config.method || 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000)
    })

    const duration = Date.now() - startTime
    const responseText = await response.text().catch(() => '')

    return {
      success: response.ok,
      integrationId,
      integrationType: 'webhook',
      responseCode: response.status,
      responseBody: truncate(responseText, 1000),
      error: response.ok ? undefined : `Webhook returned ${response.status}`,
      duration
    }
  } catch (error) {
    return {
      success: false,
      integrationId,
      integrationType: 'webhook',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    }
  }
}

// ==================== SHARED WEBHOOK HELPER ====================

async function sendWebhook(
  integrationId: string,
  integrationType: IntegrationType,
  webhookUrl: string,
  payload: IntegrationPayload,
  options: {
    includeMetadata?: boolean
    headers?: Record<string, string>
    method?: 'POST' | 'PUT'
  } = {}
): Promise<IntegrationResult> {
  const startTime = Date.now()

  try {
    // Build payload based on platform expectations
    const body: Record<string, unknown> = {
      event: 'submission.created',
      timestamp: new Date().toISOString(),
      form: {
        id: payload.formId,
        name: payload.formName
      },
      submission: {
        id: payload.submissionId,
        data: payload.data
      }
    }

    // Add metadata if requested
    if (options.includeMetadata !== false && payload.metadata) {
      body.metadata = payload.metadata
    }

    // Add AI insights
    if (payload.ai) {
      body.ai = payload.ai
    }

    const response = await fetch(webhookUrl, {
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'InputHaven-Webhook/2.0',
        ...(options.headers || {})
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000)
    })

    const duration = Date.now() - startTime
    const responseText = await response.text().catch(() => '')

    return {
      success: response.ok,
      integrationId,
      integrationType,
      responseCode: response.status,
      responseBody: truncate(responseText, 1000),
      error: response.ok ? undefined : `Webhook returned ${response.status}`,
      duration
    }
  } catch (error) {
    return {
      success: false,
      integrationId,
      integrationType,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    }
  }
}

function buildWebhookPayload(
  config: WebhookConfig,
  payload: IntegrationPayload
): Record<string, unknown> {
  // If custom payload template is provided, use it
  if (config.payloadTemplate) {
    try {
      let template = config.payloadTemplate
      
      // Replace placeholders
      template = template.replace(/\{\{form\.id\}\}/g, payload.formId)
      template = template.replace(/\{\{form\.name\}\}/g, payload.formName)
      template = template.replace(/\{\{submission\.id\}\}/g, payload.submissionId)
      template = template.replace(/\{\{timestamp\}\}/g, new Date().toISOString())
      
      // Replace data fields
      for (const [key, value] of Object.entries(payload.data)) {
        template = template.replace(new RegExp(`\\{\\{data\\.${key}\\}\\}`, 'g'), String(value || ''))
      }
      
      // Replace AI fields
      if (payload.ai) {
        for (const [key, value] of Object.entries(payload.ai)) {
          template = template.replace(new RegExp(`\\{\\{ai\\.${key}\\}\\}`, 'g'), String(value || ''))
        }
      }

      return JSON.parse(template)
    } catch {
      // Fall through to default payload
    }
  }

  // Default payload structure
  const body: Record<string, unknown> = {
    event: 'submission.created',
    timestamp: new Date().toISOString(),
    form: {
      id: payload.formId,
      name: payload.formName
    },
    submission: {
      id: payload.submissionId,
      data: payload.data
    }
  }

  if (config.includeMetadata !== false && payload.metadata) {
    body.metadata = payload.metadata
  }

  if (payload.ai) {
    body.ai = payload.ai
  }

  return body
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}
