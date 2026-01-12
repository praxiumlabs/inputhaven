/**
 * Salesforce CRM Integration Connector
 * 
 * Creates leads, contacts, and cases in Salesforce
 */

import type { SalesforceConfig, IntegrationPayload, IntegrationResult } from './types.js'

export async function sendToSalesforce(
  integrationId: string,
  config: SalesforceConfig,
  payload: IntegrationPayload
): Promise<IntegrationResult> {
  const startTime = Date.now()
  const results: { lead?: string; contact?: string; case?: string; errors: string[] } = { errors: [] }

  try {
    // Create lead if enabled
    if (config.createLead !== false) {
      const leadResult = await createSalesforceLead(config, payload)
      if (leadResult.success) {
        results.lead = leadResult.id
      } else {
        results.errors.push(`Lead: ${leadResult.error}`)
      }
    }

    // Create contact if enabled (alternative to lead)
    if (config.createContact && !config.createLead) {
      const contactResult = await createSalesforceContact(config, payload)
      if (contactResult.success) {
        results.contact = contactResult.id
      } else {
        results.errors.push(`Contact: ${contactResult.error}`)
      }
    }

    // Create case if enabled
    if (config.createCase) {
      const caseResult = await createSalesforceCase(config, payload, results.contact || results.lead)
      if (caseResult.success) {
        results.case = caseResult.id
      } else {
        results.errors.push(`Case: ${caseResult.error}`)
      }
    }

    const duration = Date.now() - startTime
    const success = results.errors.length === 0

    return {
      success,
      integrationId,
      integrationType: 'salesforce',
      responseBody: JSON.stringify(results),
      error: success ? undefined : results.errors.join('; '),
      duration
    }
  } catch (error) {
    return {
      success: false,
      integrationId,
      integrationType: 'salesforce',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    }
  }
}

async function createSalesforceLead(
  config: SalesforceConfig,
  payload: IntegrationPayload
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const fields = buildLeadFields(config, payload)

    const response = await fetch(
      `${config.instanceUrl}/services/data/v58.0/sobjects/Lead`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fields),
        signal: AbortSignal.timeout(15000)
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return { 
        success: false, 
        error: data[0]?.message || data.message || 'Failed to create lead' 
      }
    }

    return { success: true, id: data.id }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function createSalesforceContact(
  config: SalesforceConfig,
  payload: IntegrationPayload
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const fields = buildContactFields(config, payload)

    const response = await fetch(
      `${config.instanceUrl}/services/data/v58.0/sobjects/Contact`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fields),
        signal: AbortSignal.timeout(15000)
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return { 
        success: false, 
        error: data[0]?.message || data.message || 'Failed to create contact' 
      }
    }

    return { success: true, id: data.id }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function createSalesforceCase(
  config: SalesforceConfig,
  payload: IntegrationPayload,
  contactOrLeadId?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const fields: Record<string, unknown> = {
      Subject: `${payload.formName} Submission`,
      Description: buildCaseDescription(payload),
      Origin: 'Web',
      Status: 'New',
      Priority: payload.ai?.sentiment === 'urgent' ? 'High' : 'Medium'
    }

    // Link to contact if available
    if (contactOrLeadId) {
      fields.ContactId = contactOrLeadId
    }

    const response = await fetch(
      `${config.instanceUrl}/services/data/v58.0/sobjects/Case`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fields),
        signal: AbortSignal.timeout(15000)
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return { 
        success: false, 
        error: data[0]?.message || data.message || 'Failed to create case' 
      }
    }

    return { success: true, id: data.id }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

function buildLeadFields(
  config: SalesforceConfig,
  payload: IntegrationPayload
): Record<string, unknown> {
  const fields: Record<string, unknown> = {}
  const data = payload.data

  // Use field mapping if provided
  if (config.fieldMapping && Object.keys(config.fieldMapping).length > 0) {
    for (const [formField, sfField] of Object.entries(config.fieldMapping)) {
      const value = data[formField]
      if (value !== undefined && value !== null) {
        fields[sfField] = value
      }
    }
  } else {
    // Auto-map common fields
    
    // Name (LastName is required)
    const name = findName(data)
    if (name) {
      const nameParts = name.split(' ')
      fields.FirstName = nameParts[0]
      fields.LastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0]
    } else {
      fields.LastName = 'Unknown'
    }

    // Email
    const email = findEmail(data)
    if (email) fields.Email = email

    // Phone
    const phone = findPhone(data)
    if (phone) fields.Phone = phone

    // Company (required for Lead)
    const company = findCompany(data)
    fields.Company = company || payload.formName

    // Website
    const website = findWebsite(data)
    if (website) fields.Website = website

    // Description
    const message = findMessage(data)
    if (message) fields.Description = message
  }

  // Lead source
  fields.LeadSource = 'Web Form'

  return fields
}

function buildContactFields(
  config: SalesforceConfig,
  payload: IntegrationPayload
): Record<string, unknown> {
  const fields: Record<string, unknown> = {}
  const data = payload.data

  // Use field mapping if provided
  if (config.fieldMapping && Object.keys(config.fieldMapping).length > 0) {
    for (const [formField, sfField] of Object.entries(config.fieldMapping)) {
      const value = data[formField]
      if (value !== undefined && value !== null) {
        fields[sfField] = value
      }
    }
  } else {
    // Auto-map common fields
    
    // Name (LastName is required)
    const name = findName(data)
    if (name) {
      const nameParts = name.split(' ')
      fields.FirstName = nameParts[0]
      fields.LastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0]
    } else {
      fields.LastName = 'Unknown'
    }

    // Email
    const email = findEmail(data)
    if (email) fields.Email = email

    // Phone
    const phone = findPhone(data)
    if (phone) fields.Phone = phone

    // Description
    const message = findMessage(data)
    if (message) fields.Description = message
  }

  return fields
}

function buildCaseDescription(payload: IntegrationPayload): string {
  const lines: string[] = [
    `Form: ${payload.formName}`,
    `Submission ID: ${payload.submissionId}`,
    `Submitted: ${payload.metadata?.timestamp || new Date().toISOString()}`,
    '',
    '--- Form Data ---'
  ]

  for (const [key, value] of Object.entries(payload.data)) {
    if (!key.startsWith('_')) {
      lines.push(`${formatFieldName(key)}: ${value}`)
    }
  }

  if (payload.ai) {
    lines.push('')
    lines.push('--- AI Insights ---')
    if (payload.ai.sentiment) lines.push(`Sentiment: ${payload.ai.sentiment}`)
    if (payload.ai.classification) lines.push(`Category: ${payload.ai.classification}`)
    if (payload.ai.summary) lines.push(`Summary: ${payload.ai.summary}`)
  }

  return lines.join('\n')
}

// Field detection helpers (same as HubSpot)
function findEmail(data: Record<string, unknown>): string | undefined {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return value
    }
    if (key.toLowerCase().includes('email') && typeof value === 'string') {
      return value
    }
  }
  return undefined
}

function findName(data: Record<string, unknown>): string | undefined {
  const nameKeys = ['name', 'full_name', 'fullname', 'your_name']
  for (const key of nameKeys) {
    if (data[key] && typeof data[key] === 'string') {
      return data[key] as string
    }
  }
  
  const firstName = data['first_name'] || data['firstName'] || data['firstname']
  const lastName = data['last_name'] || data['lastName'] || data['lastname']
  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(' ')
  }
  
  return undefined
}

function findPhone(data: Record<string, unknown>): string | undefined {
  const phoneKeys = ['phone', 'telephone', 'mobile', 'cell', 'phone_number']
  for (const key of phoneKeys) {
    if (data[key] && typeof data[key] === 'string') {
      return data[key] as string
    }
  }
  return undefined
}

function findCompany(data: Record<string, unknown>): string | undefined {
  const companyKeys = ['company', 'organization', 'business', 'company_name']
  for (const key of companyKeys) {
    if (data[key] && typeof data[key] === 'string') {
      return data[key] as string
    }
  }
  return undefined
}

function findWebsite(data: Record<string, unknown>): string | undefined {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      try {
        new URL(value)
        return value
      } catch {
        // Not a URL
      }
    }
  }
  return undefined
}

function findMessage(data: Record<string, unknown>): string | undefined {
  const messageKeys = ['message', 'comment', 'comments', 'notes', 'description', 'inquiry']
  for (const key of messageKeys) {
    if (data[key] && typeof data[key] === 'string') {
      return data[key] as string
    }
  }
  return undefined
}

function formatFieldName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

/**
 * Verify Salesforce access
 */
export async function verifySalesforceAccess(config: SalesforceConfig): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${config.instanceUrl}/services/data/v58.0/sobjects`,
      {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`
        }
      }
    )

    if (!response.ok) {
      return { valid: false, error: 'Invalid access token or instance URL' }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
