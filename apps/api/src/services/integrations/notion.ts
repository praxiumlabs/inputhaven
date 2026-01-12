/**
 * Notion Integration Connector
 * 
 * Creates database pages from form submissions
 */

import type { NotionConfig, IntegrationPayload, IntegrationResult } from './types.js'

const NOTION_API = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'

export async function sendToNotion(
  integrationId: string,
  config: NotionConfig,
  payload: IntegrationPayload
): Promise<IntegrationResult> {
  const startTime = Date.now()

  try {
    // Build page properties
    const properties = buildNotionProperties(config, payload)

    const response = await fetch(`${NOTION_API}/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { database_id: config.databaseId },
        properties
      }),
      signal: AbortSignal.timeout(15000)
    })

    const duration = Date.now() - startTime
    const responseData = await response.json()

    if (!response.ok) {
      return {
        success: false,
        integrationId,
        integrationType: 'notion',
        responseCode: response.status,
        responseBody: JSON.stringify(responseData),
        error: responseData.message || `Notion API error: ${response.status}`,
        duration
      }
    }

    return {
      success: true,
      integrationId,
      integrationType: 'notion',
      responseCode: response.status,
      responseBody: JSON.stringify({ pageId: responseData.id }),
      duration
    }
  } catch (error) {
    return {
      success: false,
      integrationId,
      integrationType: 'notion',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    }
  }
}

function buildNotionProperties(
  config: NotionConfig,
  payload: IntegrationPayload
): Record<string, unknown> {
  const properties: Record<string, unknown> = {}

  // If property mapping exists, use it
  if (config.propertyMapping && Object.keys(config.propertyMapping).length > 0) {
    for (const [formField, mapping] of Object.entries(config.propertyMapping)) {
      const value = payload.data[formField]
      if (value !== undefined) {
        properties[mapping.notionProperty] = formatNotionValue(value, mapping.type)
      }
    }
  } else {
    // Auto-map based on field names
    // First field as title
    const dataEntries = Object.entries(payload.data).filter(([k]) => !k.startsWith('_'))
    
    if (dataEntries.length > 0) {
      const [firstKey, firstValue] = dataEntries[0]
      properties['Name'] = formatNotionValue(firstValue, 'title')
      
      // Rest as rich_text
      for (let i = 1; i < dataEntries.length; i++) {
        const [key, value] = dataEntries[i]
        const propertyName = formatFieldName(key)
        
        // Try to detect type
        if (typeof value === 'string' && isEmail(value)) {
          properties[propertyName] = formatNotionValue(value, 'email')
        } else if (typeof value === 'string' && isUrl(value)) {
          properties[propertyName] = formatNotionValue(value, 'url')
        } else if (typeof value === 'number') {
          properties[propertyName] = formatNotionValue(value, 'number')
        } else if (typeof value === 'boolean') {
          properties[propertyName] = formatNotionValue(value, 'checkbox')
        } else {
          properties[propertyName] = formatNotionValue(value, 'rich_text')
        }
      }
    }
  }

  // Add metadata properties if they don't conflict
  if (payload.metadata?.timestamp) {
    properties['Submitted At'] = formatNotionValue(payload.metadata.timestamp, 'date')
  }

  // Add AI insights
  if (payload.ai?.sentiment) {
    properties['Sentiment'] = formatNotionValue(payload.ai.sentiment, 'select')
  }
  if (payload.ai?.classification) {
    properties['Category'] = formatNotionValue(payload.ai.classification, 'select')
  }
  if (payload.ai?.tags?.length) {
    properties['Tags'] = formatNotionValue(payload.ai.tags, 'multi_select')
  }

  return properties
}

function formatNotionValue(value: unknown, type: string): unknown {
  switch (type) {
    case 'title':
      return {
        title: [{ text: { content: truncate(String(value || ''), 2000) } }]
      }
    
    case 'rich_text':
      return {
        rich_text: [{ text: { content: truncate(String(value || ''), 2000) } }]
      }
    
    case 'email':
      return { email: String(value || '') }
    
    case 'url':
      return { url: String(value || '') }
    
    case 'phone_number':
      return { phone_number: String(value || '') }
    
    case 'number':
      return { number: typeof value === 'number' ? value : parseFloat(String(value)) || 0 }
    
    case 'select':
      return { select: { name: String(value || '') } }
    
    case 'multi_select':
      const items = Array.isArray(value) ? value : [value]
      return { multi_select: items.map(item => ({ name: String(item) })) }
    
    case 'date':
      return { date: { start: String(value || new Date().toISOString()) } }
    
    case 'checkbox':
      return { checkbox: Boolean(value) }
    
    default:
      return {
        rich_text: [{ text: { content: truncate(String(value || ''), 2000) } }]
      }
  }
}

function formatFieldName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

/**
 * Verify Notion database access
 */
export async function verifyNotionAccess(config: NotionConfig): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(`${NOTION_API}/databases/${config.databaseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Notion-Version': NOTION_VERSION
      }
    })

    if (!response.ok) {
      const data = await response.json()
      return { valid: false, error: data.message || 'Cannot access database' }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
