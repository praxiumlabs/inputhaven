/**
 * Integration Types and Interfaces
 * Phase 4: Integrations Hub
 */

// ==================== INTEGRATION TYPES ====================

export type IntegrationType =
  | 'slack'
  | 'discord'
  | 'google_sheets'
  | 'notion'
  | 'airtable'
  | 'zapier'
  | 'n8n'
  | 'make'
  | 'hubspot'
  | 'salesforce'
  | 'webhook'

export interface IntegrationConfig {
  slack?: SlackConfig
  discord?: DiscordConfig
  google_sheets?: GoogleSheetsConfig
  notion?: NotionConfig
  airtable?: AirtableConfig
  zapier?: ZapierConfig
  n8n?: N8nConfig
  make?: MakeConfig
  hubspot?: HubSpotConfig
  salesforce?: SalesforceConfig
  webhook?: WebhookConfig
}

// ==================== PLATFORM CONFIGS ====================

export interface SlackConfig {
  webhookUrl: string
  channel?: string
  username?: string
  iconEmoji?: string
  messageTemplate?: string
}

export interface DiscordConfig {
  webhookUrl: string
  username?: string
  avatarUrl?: string
  embedColor?: number
  messageTemplate?: string
}

export interface GoogleSheetsConfig {
  spreadsheetId: string
  sheetName?: string
  credentials: {
    type: 'service_account' | 'oauth'
    clientEmail?: string
    privateKey?: string
    accessToken?: string
    refreshToken?: string
  }
  columnMapping?: Record<string, string>
  appendMode?: 'append' | 'overwrite'
}

export interface NotionConfig {
  accessToken: string
  databaseId: string
  propertyMapping?: Record<string, {
    notionProperty: string
    type: 'title' | 'rich_text' | 'email' | 'url' | 'phone_number' | 'number' | 'select' | 'multi_select' | 'date' | 'checkbox'
  }>
}

export interface AirtableConfig {
  apiKey: string
  baseId: string
  tableId: string
  fieldMapping?: Record<string, string>
}

export interface ZapierConfig {
  webhookUrl: string
  includeMetadata?: boolean
}

export interface N8nConfig {
  webhookUrl: string
  authHeader?: string
  authValue?: string
  includeMetadata?: boolean
}

export interface MakeConfig {
  webhookUrl: string
  includeMetadata?: boolean
}

export interface HubSpotConfig {
  accessToken: string
  portalId?: string
  createContact?: boolean
  createDeal?: boolean
  dealPipeline?: string
  dealStage?: string
  fieldMapping?: Record<string, string>
}

export interface SalesforceConfig {
  instanceUrl: string
  accessToken: string
  refreshToken?: string
  createLead?: boolean
  createContact?: boolean
  createCase?: boolean
  fieldMapping?: Record<string, string>
}

export interface WebhookConfig {
  url: string
  method?: 'POST' | 'PUT' | 'PATCH'
  headers?: Record<string, string>
  authType?: 'none' | 'basic' | 'bearer' | 'api_key'
  authCredentials?: {
    username?: string
    password?: string
    token?: string
    headerName?: string
    apiKey?: string
  }
  payloadTemplate?: string
  includeMetadata?: boolean
}

// ==================== EXECUTION TYPES ====================

export interface IntegrationPayload {
  formId: string
  formName: string
  submissionId: string
  data: Record<string, unknown>
  metadata?: {
    ip?: string
    userAgent?: string
    country?: string
    timestamp: string
    source?: string
  }
  ai?: {
    classification?: string
    sentiment?: string
    summary?: string
    tags?: string[]
  }
}

export interface IntegrationResult {
  success: boolean
  integrationId: string
  integrationType: IntegrationType
  responseCode?: number
  responseBody?: string
  error?: string
  duration: number
}

export interface IntegrationDefinition {
  type: IntegrationType
  name: string
  description: string
  icon: string
  color: string
  category: 'communication' | 'spreadsheet' | 'crm' | 'automation' | 'database' | 'webhook'
  configSchema: Record<string, ConfigField>
  features: string[]
  docsUrl: string
}

export interface ConfigField {
  type: 'string' | 'password' | 'url' | 'select' | 'boolean' | 'json' | 'mapping'
  label: string
  description?: string
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  default?: unknown
}

// ==================== INTEGRATION REGISTRY ====================

export const INTEGRATION_DEFINITIONS: Record<IntegrationType, IntegrationDefinition> = {
  slack: {
    type: 'slack',
    name: 'Slack',
    description: 'Send form submissions to Slack channels',
    icon: 'slack',
    color: '#4A154B',
    category: 'communication',
    features: ['Real-time notifications', 'Custom message formatting', 'Channel selection'],
    docsUrl: 'https://docs.inputhaven.com/integrations/slack',
    configSchema: {
      webhookUrl: { type: 'url', label: 'Webhook URL', required: true, placeholder: 'https://hooks.slack.com/services/...' },
      channel: { type: 'string', label: 'Channel', placeholder: '#general' },
      username: { type: 'string', label: 'Bot Username', default: 'InputHaven' },
      iconEmoji: { type: 'string', label: 'Icon Emoji', default: ':inbox_tray:' }
    }
  },
  discord: {
    type: 'discord',
    name: 'Discord',
    description: 'Send form submissions to Discord channels',
    icon: 'discord',
    color: '#5865F2',
    category: 'communication',
    features: ['Rich embeds', 'Custom colors', 'Webhook integration'],
    docsUrl: 'https://docs.inputhaven.com/integrations/discord',
    configSchema: {
      webhookUrl: { type: 'url', label: 'Webhook URL', required: true, placeholder: 'https://discord.com/api/webhooks/...' },
      username: { type: 'string', label: 'Bot Username', default: 'InputHaven' },
      avatarUrl: { type: 'url', label: 'Avatar URL' },
      embedColor: { type: 'string', label: 'Embed Color', placeholder: '#6366f1' }
    }
  },
  google_sheets: {
    type: 'google_sheets',
    name: 'Google Sheets',
    description: 'Automatically add submissions to Google Sheets',
    icon: 'sheets',
    color: '#34A853',
    category: 'spreadsheet',
    features: ['Auto-append rows', 'Column mapping', 'Real-time sync'],
    docsUrl: 'https://docs.inputhaven.com/integrations/google-sheets',
    configSchema: {
      spreadsheetId: { type: 'string', label: 'Spreadsheet ID', required: true },
      sheetName: { type: 'string', label: 'Sheet Name', default: 'Sheet1' },
      credentials: { type: 'json', label: 'Service Account Credentials', required: true }
    }
  },
  notion: {
    type: 'notion',
    name: 'Notion',
    description: 'Create Notion database entries from submissions',
    icon: 'notion',
    color: '#000000',
    category: 'database',
    features: ['Database integration', 'Property mapping', 'Rich text support'],
    docsUrl: 'https://docs.inputhaven.com/integrations/notion',
    configSchema: {
      accessToken: { type: 'password', label: 'Integration Token', required: true },
      databaseId: { type: 'string', label: 'Database ID', required: true },
      propertyMapping: { type: 'mapping', label: 'Property Mapping' }
    }
  },
  airtable: {
    type: 'airtable',
    name: 'Airtable',
    description: 'Add submissions to Airtable bases',
    icon: 'airtable',
    color: '#18BFFF',
    category: 'database',
    features: ['Table integration', 'Field mapping', 'Attachments support'],
    docsUrl: 'https://docs.inputhaven.com/integrations/airtable',
    configSchema: {
      apiKey: { type: 'password', label: 'API Key', required: true },
      baseId: { type: 'string', label: 'Base ID', required: true },
      tableId: { type: 'string', label: 'Table ID', required: true },
      fieldMapping: { type: 'mapping', label: 'Field Mapping' }
    }
  },
  zapier: {
    type: 'zapier',
    name: 'Zapier',
    description: 'Trigger Zapier workflows on new submissions',
    icon: 'zapier',
    color: '#FF4A00',
    category: 'automation',
    features: ['5000+ app integrations', 'Multi-step workflows', 'Conditional logic'],
    docsUrl: 'https://docs.inputhaven.com/integrations/zapier',
    configSchema: {
      webhookUrl: { type: 'url', label: 'Webhook URL', required: true, placeholder: 'https://hooks.zapier.com/...' },
      includeMetadata: { type: 'boolean', label: 'Include Metadata', default: true }
    }
  },
  n8n: {
    type: 'n8n',
    name: 'n8n',
    description: 'Connect to n8n workflows',
    icon: 'n8n',
    color: '#EA4B71',
    category: 'automation',
    features: ['Self-hosted option', 'Visual workflows', 'Code nodes'],
    docsUrl: 'https://docs.inputhaven.com/integrations/n8n',
    configSchema: {
      webhookUrl: { type: 'url', label: 'Webhook URL', required: true },
      authHeader: { type: 'string', label: 'Auth Header Name' },
      authValue: { type: 'password', label: 'Auth Header Value' },
      includeMetadata: { type: 'boolean', label: 'Include Metadata', default: true }
    }
  },
  make: {
    type: 'make',
    name: 'Make (Integromat)',
    description: 'Trigger Make scenarios on submissions',
    icon: 'make',
    color: '#6D00CC',
    category: 'automation',
    features: ['Visual automation', 'Error handling', 'Scheduling'],
    docsUrl: 'https://docs.inputhaven.com/integrations/make',
    configSchema: {
      webhookUrl: { type: 'url', label: 'Webhook URL', required: true, placeholder: 'https://hook.make.com/...' },
      includeMetadata: { type: 'boolean', label: 'Include Metadata', default: true }
    }
  },
  hubspot: {
    type: 'hubspot',
    name: 'HubSpot',
    description: 'Create contacts and deals in HubSpot',
    icon: 'hubspot',
    color: '#FF7A59',
    category: 'crm',
    features: ['Contact creation', 'Deal creation', 'Custom properties'],
    docsUrl: 'https://docs.inputhaven.com/integrations/hubspot',
    configSchema: {
      accessToken: { type: 'password', label: 'Private App Token', required: true },
      createContact: { type: 'boolean', label: 'Create Contact', default: true },
      createDeal: { type: 'boolean', label: 'Create Deal', default: false },
      dealPipeline: { type: 'string', label: 'Deal Pipeline ID' },
      dealStage: { type: 'string', label: 'Deal Stage ID' },
      fieldMapping: { type: 'mapping', label: 'Field Mapping' }
    }
  },
  salesforce: {
    type: 'salesforce',
    name: 'Salesforce',
    description: 'Create leads and contacts in Salesforce',
    icon: 'salesforce',
    color: '#00A1E0',
    category: 'crm',
    features: ['Lead creation', 'Contact creation', 'Case creation'],
    docsUrl: 'https://docs.inputhaven.com/integrations/salesforce',
    configSchema: {
      instanceUrl: { type: 'url', label: 'Instance URL', required: true },
      accessToken: { type: 'password', label: 'Access Token', required: true },
      createLead: { type: 'boolean', label: 'Create Lead', default: true },
      createContact: { type: 'boolean', label: 'Create Contact', default: false },
      fieldMapping: { type: 'mapping', label: 'Field Mapping' }
    }
  },
  webhook: {
    type: 'webhook',
    name: 'Custom Webhook',
    description: 'Send submissions to any HTTP endpoint',
    icon: 'webhook',
    color: '#6366F1',
    category: 'webhook',
    features: ['Custom headers', 'Authentication', 'Payload templates'],
    docsUrl: 'https://docs.inputhaven.com/integrations/webhook',
    configSchema: {
      url: { type: 'url', label: 'Webhook URL', required: true },
      method: { type: 'select', label: 'HTTP Method', options: [{ value: 'POST', label: 'POST' }, { value: 'PUT', label: 'PUT' }], default: 'POST' },
      authType: { type: 'select', label: 'Authentication', options: [
        { value: 'none', label: 'None' },
        { value: 'basic', label: 'Basic Auth' },
        { value: 'bearer', label: 'Bearer Token' },
        { value: 'api_key', label: 'API Key' }
      ], default: 'none' },
      headers: { type: 'json', label: 'Custom Headers' },
      includeMetadata: { type: 'boolean', label: 'Include Metadata', default: true }
    }
  }
}
