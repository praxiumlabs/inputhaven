/**
 * HubSpot CRM Integration Connector
 * 
 * Creates contacts and deals in HubSpot
 */

import type { HubSpotConfig, IntegrationPayload, IntegrationResult } from './types.js'

const HUBSPOT_API = 'https://api.hubapi.com'

export async function sendToHubSpot(
  integrationId: string,
  config: HubSpotConfig,
  payload: IntegrationPayload
): Promise<IntegrationResult> {
  const startTime = Date.now()
  const results: { contact?: string; deal?: string; errors: string[] } = { errors: [] }

  try {
    // Create contact if enabled
    if (config.createContact !== false) {
      const contactResult = await createHubSpotContact(config, payload)
      if (contactResult.success) {
        results.contact = contactResult.id
      } else {
        results.errors.push(`Contact: ${contactResult.error}`)
      }
    }

    // Create deal if enabled and contact was created
    if (config.createDeal && results.contact) {
      const dealResult = await createHubSpotDeal(config, payload, results.contact)
      if (dealResult.success) {
        results.deal = dealResult.id
      } else {
        results.errors.push(`Deal: ${dealResult.error}`)
      }
    }

    const duration = Date.now() - startTime
    const success = results.errors.length === 0

    return {
      success,
      integrationId,
      integrationType: 'hubspot',
      responseBody: JSON.stringify(results),
      error: success ? undefined : results.errors.join('; '),
      duration
    }
  } catch (error) {
    return {
      success: false,
      integrationId,
      integrationType: 'hubspot',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    }
  }
}

async function createHubSpotContact(
  config: HubSpotConfig,
  payload: IntegrationPayload
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const properties = buildContactProperties(config, payload)

    const response = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ properties }),
      signal: AbortSignal.timeout(15000)
    })

    const data = await response.json()

    if (!response.ok) {
      // Check if contact already exists
      if (data.category === 'CONFLICT') {
        // Try to find existing contact by email
        const email = findEmail(payload.data)
        if (email) {
          const existingContact = await findHubSpotContact(config, email)
          if (existingContact) {
            return { success: true, id: existingContact }
          }
        }
      }
      return { success: false, error: data.message || 'Failed to create contact' }
    }

    return { success: true, id: data.id }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function findHubSpotContact(
  config: HubSpotConfig,
  email: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${HUBSPOT_API}/crm/v3/objects/contacts/search`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: 'email',
              operator: 'EQ',
              value: email
            }]
          }]
        })
      }
    )

    const data = await response.json()
    return data.results?.[0]?.id || null
  } catch {
    return null
  }
}

async function createHubSpotDeal(
  config: HubSpotConfig,
  payload: IntegrationPayload,
  contactId: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const properties: Record<string, string> = {
      dealname: `${payload.formName} - ${findName(payload.data) || 'New Lead'}`,
      dealstage: config.dealStage || 'appointmentscheduled',
      pipeline: config.dealPipeline || 'default'
    }

    // Add deal amount if present
    const amount = findAmount(payload.data)
    if (amount) {
      properties.amount = String(amount)
    }

    const response = await fetch(`${HUBSPOT_API}/crm/v3/objects/deals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties,
        associations: [{
          to: { id: contactId },
          types: [{
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: 3 // Deal to Contact
          }]
        }]
      }),
      signal: AbortSignal.timeout(15000)
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.message || 'Failed to create deal' }
    }

    return { success: true, id: data.id }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

function buildContactProperties(
  config: HubSpotConfig,
  payload: IntegrationPayload
): Record<string, string> {
  const properties: Record<string, string> = {}

  // Use field mapping if provided
  if (config.fieldMapping && Object.keys(config.fieldMapping).length > 0) {
    for (const [formField, hubspotField] of Object.entries(config.fieldMapping)) {
      const value = payload.data[formField]
      if (value !== undefined && value !== null) {
        properties[hubspotField] = String(value)
      }
    }
  } else {
    // Auto-map common fields
    const data = payload.data

    // Email (required)
    const email = findEmail(data)
    if (email) properties.email = email

    // Name
    const name = findName(data)
    if (name) {
      const nameParts = name.split(' ')
      properties.firstname = nameParts[0]
      if (nameParts.length > 1) {
        properties.lastname = nameParts.slice(1).join(' ')
      }
    }

    // Phone
    const phone = findPhone(data)
    if (phone) properties.phone = phone

    // Company
    const company = findCompany(data)
    if (company) properties.company = company

    // Website
    const website = findWebsite(data)
    if (website) properties.website = website

    // Message as notes
    const message = findMessage(data)
    if (message) properties.hs_content_membership_notes = truncate(message, 65535)
  }

  // Add source tracking
  properties.hs_lead_status = 'NEW'
  properties.lifecyclestage = 'lead'

  return properties
}

// Field detection helpers
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
  
  // Try first_name + last_name
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
    if (key.toLowerCase().includes('website') && typeof value === 'string') {
      return value
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

function findAmount(data: Record<string, unknown>): number | undefined {
  const amountKeys = ['amount', 'budget', 'value', 'price', 'deal_value']
  for (const key of amountKeys) {
    const value = data[key]
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''))
      if (!isNaN(parsed)) return parsed
    }
  }
  return undefined
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * Verify HubSpot access
 */
export async function verifyHubSpotAccess(config: HubSpotConfig): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts?limit=1`, {
      headers: {
        'Authorization': `Bearer ${config.accessToken}`
      }
    })

    if (!response.ok) {
      const data = await response.json()
      return { valid: false, error: data.message || 'Invalid access token' }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
