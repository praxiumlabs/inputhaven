/**
 * Integration Service
 * 
 * Main orchestrator for all integration connectors.
 * Handles execution, logging, and error handling.
 */

import type {
  IntegrationType,
  IntegrationConfig,
  IntegrationPayload,
  IntegrationResult,
  INTEGRATION_DEFINITIONS
} from './types.js'
import { sendToSlack } from './slack.js'
import { sendToDiscord } from './discord.js'
import { sendToGoogleSheets } from './google-sheets.js'
import { sendToNotion } from './notion.js'
import { sendToAirtable } from './airtable.js'
import { sendToZapier, sendToN8n, sendToMake, sendToWebhook } from './webhooks.js'
import { sendToHubSpot } from './hubspot.js'
import { sendToSalesforce } from './salesforce.js'

// Re-export types and definitions
export * from './types.js'

/**
 * Integration stored in database
 */
export interface StoredIntegration {
  id: string
  workspaceId: string
  type: IntegrationType
  name: string
  config: IntegrationConfig
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Integration execution log
 */
export interface IntegrationLog {
  id: string
  integrationId: string
  formId: string
  submissionId: string
  success: boolean
  responseCode?: number
  responseBody?: string
  error?: string
  duration: number
  createdAt: Date
}

/**
 * Execute all active integrations for a workspace
 */
export async function executeIntegrations(
  integrations: StoredIntegration[],
  payload: IntegrationPayload,
  options: {
    parallel?: boolean
    logCallback?: (log: IntegrationLog) => Promise<void>
  } = {}
): Promise<IntegrationResult[]> {
  const activeIntegrations = integrations.filter(i => i.isActive)
  
  if (activeIntegrations.length === 0) {
    return []
  }

  const execute = async (integration: StoredIntegration): Promise<IntegrationResult> => {
    const result = await executeIntegration(integration, payload)
    
    // Log result if callback provided
    if (options.logCallback) {
      await options.logCallback({
        id: crypto.randomUUID(),
        integrationId: integration.id,
        formId: payload.formId,
        submissionId: payload.submissionId,
        success: result.success,
        responseCode: result.responseCode,
        responseBody: result.responseBody,
        error: result.error,
        duration: result.duration,
        createdAt: new Date()
      })
    }

    return result
  }

  if (options.parallel !== false) {
    // Execute all in parallel
    return Promise.all(activeIntegrations.map(execute))
  } else {
    // Execute sequentially
    const results: IntegrationResult[] = []
    for (const integration of activeIntegrations) {
      results.push(await execute(integration))
    }
    return results
  }
}

/**
 * Execute a single integration
 */
export async function executeIntegration(
  integration: StoredIntegration,
  payload: IntegrationPayload
): Promise<IntegrationResult> {
  const config = integration.config

  try {
    switch (integration.type) {
      case 'slack':
        if (!config.slack) throw new Error('Slack config missing')
        return sendToSlack(integration.id, config.slack, payload)

      case 'discord':
        if (!config.discord) throw new Error('Discord config missing')
        return sendToDiscord(integration.id, config.discord, payload)

      case 'google_sheets':
        if (!config.google_sheets) throw new Error('Google Sheets config missing')
        return sendToGoogleSheets(integration.id, config.google_sheets, payload)

      case 'notion':
        if (!config.notion) throw new Error('Notion config missing')
        return sendToNotion(integration.id, config.notion, payload)

      case 'airtable':
        if (!config.airtable) throw new Error('Airtable config missing')
        return sendToAirtable(integration.id, config.airtable, payload)

      case 'zapier':
        if (!config.zapier) throw new Error('Zapier config missing')
        return sendToZapier(integration.id, config.zapier, payload)

      case 'n8n':
        if (!config.n8n) throw new Error('n8n config missing')
        return sendToN8n(integration.id, config.n8n, payload)

      case 'make':
        if (!config.make) throw new Error('Make config missing')
        return sendToMake(integration.id, config.make, payload)

      case 'hubspot':
        if (!config.hubspot) throw new Error('HubSpot config missing')
        return sendToHubSpot(integration.id, config.hubspot, payload)

      case 'salesforce':
        if (!config.salesforce) throw new Error('Salesforce config missing')
        return sendToSalesforce(integration.id, config.salesforce, payload)

      case 'webhook':
        if (!config.webhook) throw new Error('Webhook config missing')
        return sendToWebhook(integration.id, config.webhook, payload)

      default:
        return {
          success: false,
          integrationId: integration.id,
          integrationType: integration.type,
          error: `Unknown integration type: ${integration.type}`,
          duration: 0
        }
    }
  } catch (error) {
    return {
      success: false,
      integrationId: integration.id,
      integrationType: integration.type,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: 0
    }
  }
}

/**
 * Validate integration config before saving
 */
export function validateIntegrationConfig(
  type: IntegrationType,
  config: IntegrationConfig
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  switch (type) {
    case 'slack':
      if (!config.slack?.webhookUrl) {
        errors.push('Slack webhook URL is required')
      } else if (!config.slack.webhookUrl.startsWith('https://hooks.slack.com/')) {
        errors.push('Invalid Slack webhook URL')
      }
      break

    case 'discord':
      if (!config.discord?.webhookUrl) {
        errors.push('Discord webhook URL is required')
      } else if (!config.discord.webhookUrl.includes('discord.com/api/webhooks/')) {
        errors.push('Invalid Discord webhook URL')
      }
      break

    case 'google_sheets':
      if (!config.google_sheets?.spreadsheetId) {
        errors.push('Spreadsheet ID is required')
      }
      if (!config.google_sheets?.credentials) {
        errors.push('Credentials are required')
      }
      break

    case 'notion':
      if (!config.notion?.accessToken) {
        errors.push('Notion access token is required')
      }
      if (!config.notion?.databaseId) {
        errors.push('Notion database ID is required')
      }
      break

    case 'airtable':
      if (!config.airtable?.apiKey) {
        errors.push('Airtable API key is required')
      }
      if (!config.airtable?.baseId) {
        errors.push('Airtable base ID is required')
      }
      if (!config.airtable?.tableId) {
        errors.push('Airtable table ID is required')
      }
      break

    case 'zapier':
      if (!config.zapier?.webhookUrl) {
        errors.push('Zapier webhook URL is required')
      }
      break

    case 'n8n':
      if (!config.n8n?.webhookUrl) {
        errors.push('n8n webhook URL is required')
      }
      break

    case 'make':
      if (!config.make?.webhookUrl) {
        errors.push('Make webhook URL is required')
      }
      break

    case 'hubspot':
      if (!config.hubspot?.accessToken) {
        errors.push('HubSpot access token is required')
      }
      break

    case 'salesforce':
      if (!config.salesforce?.instanceUrl) {
        errors.push('Salesforce instance URL is required')
      }
      if (!config.salesforce?.accessToken) {
        errors.push('Salesforce access token is required')
      }
      break

    case 'webhook':
      if (!config.webhook?.url) {
        errors.push('Webhook URL is required')
      }
      break

    default:
      errors.push(`Unknown integration type: ${type}`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Test an integration connection
 */
export async function testIntegration(
  type: IntegrationType,
  config: IntegrationConfig
): Promise<{ success: boolean; message: string }> {
  // Create test payload
  const testPayload: IntegrationPayload = {
    formId: 'test-form',
    formName: 'Test Form',
    submissionId: 'test-submission',
    data: {
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test submission from InputHaven.'
    },
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'integration-test'
    }
  }

  const testIntegration: StoredIntegration = {
    id: 'test',
    workspaceId: 'test',
    type,
    name: 'Test Integration',
    config,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const result = await executeIntegration(testIntegration, testPayload)

  if (result.success) {
    return {
      success: true,
      message: 'Integration test successful!'
    }
  } else {
    return {
      success: false,
      message: result.error || 'Integration test failed'
    }
  }
}

/**
 * Encrypt sensitive config data
 */
export function encryptConfig(config: IntegrationConfig, key: string): string {
  // In production, use proper encryption (e.g., AES-256-GCM)
  // This is a placeholder that should be replaced with actual encryption
  const crypto = require('crypto')
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv)
  
  let encrypted = cipher.update(JSON.stringify(config), 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return JSON.stringify({
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    data: encrypted
  })
}

/**
 * Decrypt sensitive config data
 */
export function decryptConfig(encryptedData: string, key: string): IntegrationConfig {
  const crypto = require('crypto')
  const { iv, authTag, data } = JSON.parse(encryptedData)
  
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex')
  )
  decipher.setAuthTag(Buffer.from(authTag, 'hex'))
  
  let decrypted = decipher.update(data, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return JSON.parse(decrypted)
}

/**
 * Mask sensitive fields for display
 */
export function maskConfig(config: IntegrationConfig): IntegrationConfig {
  const masked = JSON.parse(JSON.stringify(config))
  
  const maskValue = (value: string): string => {
    if (value.length <= 8) return '••••••••'
    return value.slice(0, 4) + '••••••••' + value.slice(-4)
  }

  // Mask sensitive fields
  if (masked.slack?.webhookUrl) {
    masked.slack.webhookUrl = maskValue(masked.slack.webhookUrl)
  }
  if (masked.discord?.webhookUrl) {
    masked.discord.webhookUrl = maskValue(masked.discord.webhookUrl)
  }
  if (masked.notion?.accessToken) {
    masked.notion.accessToken = maskValue(masked.notion.accessToken)
  }
  if (masked.airtable?.apiKey) {
    masked.airtable.apiKey = maskValue(masked.airtable.apiKey)
  }
  if (masked.hubspot?.accessToken) {
    masked.hubspot.accessToken = maskValue(masked.hubspot.accessToken)
  }
  if (masked.salesforce?.accessToken) {
    masked.salesforce.accessToken = maskValue(masked.salesforce.accessToken)
  }
  if (masked.webhook?.authCredentials?.token) {
    masked.webhook.authCredentials.token = maskValue(masked.webhook.authCredentials.token)
  }
  if (masked.webhook?.authCredentials?.password) {
    masked.webhook.authCredentials.password = '••••••••'
  }
  if (masked.webhook?.authCredentials?.apiKey) {
    masked.webhook.authCredentials.apiKey = maskValue(masked.webhook.authCredentials.apiKey)
  }

  return masked
}
