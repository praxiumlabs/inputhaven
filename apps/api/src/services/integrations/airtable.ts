/**
 * Airtable Integration Connector
 * 
 * Creates records in Airtable bases
 */

import type { AirtableConfig, IntegrationPayload, IntegrationResult } from './types.js'

const AIRTABLE_API = 'https://api.airtable.com/v0'

export async function sendToAirtable(
  integrationId: string,
  config: AirtableConfig,
  payload: IntegrationPayload
): Promise<IntegrationResult> {
  const startTime = Date.now()

  try {
    // Build record fields
    const fields = buildAirtableFields(config, payload)

    const response = await fetch(
      `${AIRTABLE_API}/${config.baseId}/${config.tableId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [{ fields }],
          typecast: true // Auto-convert values to match field types
        }),
        signal: AbortSignal.timeout(15000)
      }
    )

    const duration = Date.now() - startTime
    const responseData = await response.json()

    if (!response.ok) {
      return {
        success: false,
        integrationId,
        integrationType: 'airtable',
        responseCode: response.status,
        responseBody: JSON.stringify(responseData),
        error: responseData.error?.message || `Airtable API error: ${response.status}`,
        duration
      }
    }

    return {
      success: true,
      integrationId,
      integrationType: 'airtable',
      responseCode: response.status,
      responseBody: JSON.stringify({ recordId: responseData.records?.[0]?.id }),
      duration
    }
  } catch (error) {
    return {
      success: false,
      integrationId,
      integrationType: 'airtable',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    }
  }
}

function buildAirtableFields(
  config: AirtableConfig,
  payload: IntegrationPayload
): Record<string, unknown> {
  const fields: Record<string, unknown> = {}

  // If field mapping exists, use it
  if (config.fieldMapping && Object.keys(config.fieldMapping).length > 0) {
    for (const [formField, airtableField] of Object.entries(config.fieldMapping)) {
      const value = payload.data[formField]
      if (value !== undefined) {
        fields[airtableField] = formatAirtableValue(value)
      }
    }
  } else {
    // Auto-map fields
    for (const [key, value] of Object.entries(payload.data)) {
      if (!key.startsWith('_')) {
        const fieldName = formatFieldName(key)
        fields[fieldName] = formatAirtableValue(value)
      }
    }
  }

  // Add metadata
  fields['Submission ID'] = payload.submissionId
  fields['Submitted At'] = payload.metadata?.timestamp || new Date().toISOString()
  fields['Form Name'] = payload.formName

  // Add AI insights
  if (payload.ai) {
    if (payload.ai.sentiment) fields['Sentiment'] = payload.ai.sentiment
    if (payload.ai.classification) fields['Category'] = payload.ai.classification
    if (payload.ai.summary) fields['Summary'] = payload.ai.summary
    if (payload.ai.tags?.length) fields['Tags'] = payload.ai.tags
  }

  return fields
}

function formatAirtableValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return ''
  }
  
  if (Array.isArray(value)) {
    return value.map(v => String(v))
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  
  return value
}

function formatFieldName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

/**
 * Verify Airtable base access
 */
export async function verifyAirtableAccess(config: AirtableConfig): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${AIRTABLE_API}/${config.baseId}/${config.tableId}?maxRecords=1`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      }
    )

    if (!response.ok) {
      const data = await response.json()
      return { valid: false, error: data.error?.message || 'Cannot access table' }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Get Airtable table schema for field mapping
 */
export async function getAirtableSchema(config: AirtableConfig): Promise<{ fields: string[] } | null> {
  try {
    // Airtable doesn't have a direct schema endpoint, but we can infer from metadata
    const response = await fetch(
      `https://api.airtable.com/v0/meta/bases/${config.baseId}/tables`,
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    const table = data.tables?.find((t: { id: string }) => t.id === config.tableId)
    
    if (!table) return null

    return {
      fields: table.fields?.map((f: { name: string }) => f.name) || []
    }
  } catch {
    return null
  }
}
