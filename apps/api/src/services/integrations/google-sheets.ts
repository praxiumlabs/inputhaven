/**
 * Google Sheets Integration Connector
 * 
 * Uses Google Sheets API v4 to append rows
 */

import type { GoogleSheetsConfig, IntegrationPayload, IntegrationResult } from './types.js'

const GOOGLE_SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets'

export async function sendToGoogleSheets(
  integrationId: string,
  config: GoogleSheetsConfig,
  payload: IntegrationPayload
): Promise<IntegrationResult> {
  const startTime = Date.now()

  try {
    // Get access token
    const accessToken = await getAccessToken(config.credentials)
    
    if (!accessToken) {
      return {
        success: false,
        integrationId,
        integrationType: 'google_sheets',
        error: 'Failed to obtain access token',
        duration: Date.now() - startTime
      }
    }

    // Build row data
    const rowData = buildRowData(config, payload)
    
    const sheetName = config.sheetName || 'Sheet1'
    const range = `${sheetName}!A:Z`

    // Append to spreadsheet
    const response = await fetch(
      `${GOOGLE_SHEETS_API}/${config.spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [rowData]
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
        integrationType: 'google_sheets',
        responseCode: response.status,
        responseBody: JSON.stringify(responseData),
        error: responseData.error?.message || `Google Sheets API error: ${response.status}`,
        duration
      }
    }

    return {
      success: true,
      integrationId,
      integrationType: 'google_sheets',
      responseCode: response.status,
      responseBody: JSON.stringify(responseData),
      duration
    }
  } catch (error) {
    return {
      success: false,
      integrationId,
      integrationType: 'google_sheets',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    }
  }
}

async function getAccessToken(credentials: GoogleSheetsConfig['credentials']): Promise<string | null> {
  if (credentials.type === 'oauth' && credentials.accessToken) {
    return credentials.accessToken
  }

  if (credentials.type === 'service_account' && credentials.clientEmail && credentials.privateKey) {
    return getServiceAccountToken(credentials.clientEmail, credentials.privateKey)
  }

  return null
}

async function getServiceAccountToken(clientEmail: string, privateKey: string): Promise<string | null> {
  try {
    // Create JWT for service account
    const now = Math.floor(Date.now() / 1000)
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    }
    const payload = {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600
    }

    // Note: In production, use a proper JWT library like jose
    // This is a simplified version
    const jwt = await createJWT(header, payload, privateKey)

    // Exchange JWT for access token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    })

    const data = await response.json()
    return data.access_token || null
  } catch {
    return null
  }
}

async function createJWT(header: object, payload: object, privateKey: string): Promise<string> {
  // Base64url encode
  const b64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url')
  
  const headerB64 = b64(header)
  const payloadB64 = b64(payload)
  const message = `${headerB64}.${payloadB64}`

  // Import crypto for signing
  const crypto = await import('crypto')
  
  // Clean up private key
  const cleanKey = privateKey.replace(/\\n/g, '\n')
  
  // Sign with RSA-SHA256
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(message)
  const signature = sign.sign(cleanKey, 'base64url')

  return `${message}.${signature}`
}

function buildRowData(config: GoogleSheetsConfig, payload: IntegrationPayload): string[] {
  const row: string[] = []

  // Add timestamp
  row.push(new Date().toISOString())

  // Add submission ID
  row.push(payload.submissionId)

  // Add form data based on column mapping or all fields
  if (config.columnMapping && Object.keys(config.columnMapping).length > 0) {
    // Use column mapping
    for (const [formField, _] of Object.entries(config.columnMapping)) {
      const value = payload.data[formField]
      row.push(value !== undefined ? String(value) : '')
    }
  } else {
    // Add all fields
    for (const [key, value] of Object.entries(payload.data)) {
      if (!key.startsWith('_')) {
        row.push(value !== undefined ? String(value) : '')
      }
    }
  }

  // Add metadata
  if (payload.metadata) {
    row.push(payload.metadata.ip || '')
    row.push(payload.metadata.country || '')
  }

  // Add AI insights
  if (payload.ai) {
    row.push(payload.ai.sentiment || '')
    row.push(payload.ai.classification || '')
    row.push(payload.ai.summary || '')
  }

  return row
}

/**
 * Get headers for a new sheet
 */
export function getSheetHeaders(config: GoogleSheetsConfig, samplePayload: IntegrationPayload): string[] {
  const headers: string[] = ['Timestamp', 'Submission ID']

  if (config.columnMapping && Object.keys(config.columnMapping).length > 0) {
    for (const [_, columnName] of Object.entries(config.columnMapping)) {
      headers.push(columnName)
    }
  } else {
    for (const key of Object.keys(samplePayload.data)) {
      if (!key.startsWith('_')) {
        headers.push(formatFieldName(key))
      }
    }
  }

  headers.push('IP Address', 'Country')
  headers.push('Sentiment', 'Classification', 'Summary')

  return headers
}

function formatFieldName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}
