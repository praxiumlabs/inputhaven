// ==================== CORE TYPES ====================

export interface InputHavenConfig {
  /** Your InputHaven API key */
  apiKey: string
  /** API base URL (defaults to https://api.inputhaven.com) */
  baseUrl?: string
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number
  /** Enable debug logging */
  debug?: boolean
  /** Custom fetch implementation */
  fetch?: typeof fetch
}

export interface FormConfig {
  /** Form ID or access key */
  formId: string
  /** Optional workspace ID */
  workspaceId?: string
}

// ==================== SUBMISSION TYPES ====================

export interface SubmissionData {
  [key: string]: any
}

export interface SubmissionOptions {
  /** Skip spam detection */
  skipSpamCheck?: boolean
  /** Skip AI processing */
  skipAiProcessing?: boolean
  /** Custom metadata to include */
  metadata?: Record<string, any>
  /** Honeypot field value (for spam detection) */
  honeypot?: string
}

export interface SubmissionResult {
  success: boolean
  submissionId?: string
  message?: string
  processingTime?: string
  error?: {
    code: string
    message: string
  }
}

// ==================== FORM TYPES ====================

export interface Form {
  id: string
  name: string
  description?: string
  accessKey: string
  schema: FormSchema
  isActive: boolean
  submissionCount: number
  createdAt: string
  updatedAt: string
}

export interface FormSchema {
  fields: Record<string, FieldDefinition>
  required?: string[]
}

export interface FieldDefinition {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  title?: string
  description?: string
  required?: boolean
  format?: string
  enum?: string[]
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  semanticType?: string
  default?: any
}

// ==================== UFP TYPES ====================

export interface UFPSchema {
  ufp_version: string
  form_id: string
  form_name: string
  description?: string
  fields: UFPField[]
  submission_url: string
  capabilities: UFPCapabilities
}

export interface UFPField {
  name: string
  type: string
  title: string
  description?: string
  required: boolean
  semantic_type?: string
  validation?: UFPValidation
  ai_hints?: Record<string, any>
}

export interface UFPValidation {
  format?: string
  pattern?: string
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  enum?: string[]
}

export interface UFPCapabilities {
  ai_processing: boolean
  file_upload: boolean
  webhooks: boolean
  auto_response: boolean
}

// ==================== SEMANTIC TYPES ====================

export interface SemanticType {
  namespace: string
  name: string
  fullPath: string
  description: string
  examples: string[]
  jsonSchemaType: string
  schemaOrgType?: string
  openApiFormat?: string
}

export interface SemanticTypeRegistry {
  types: SemanticType[]
  namespaces: string[]
}

// ==================== TEMPLATE TYPES ====================

export interface Template {
  id: string
  name: string
  slug: string
  type: TemplateType
  category?: string
  description?: string
  schema: any
  isSystem: boolean
  isPublic: boolean
  version: number
  aiEnabled: boolean
  mcpEnabled: boolean
}

export type TemplateType =
  | 'FORM_SCHEMA'
  | 'EMAIL_NOTIFICATION'
  | 'AUTO_RESPONSE'
  | 'WEBHOOK_PAYLOAD'
  | 'AI_PROCESSOR'
  | 'OUTPUT_TRANSFORM'
  | 'AGENT_INSTRUCTION'

// ==================== AI PROCESSING TYPES ====================

export interface AIProcessingResult {
  classification?: string
  sentiment?: 'positive' | 'negative' | 'neutral' | 'frustrated' | 'urgent'
  summary?: string
  tags?: string[]
  entities?: ExtractedEntities
  confidence?: number
  processingTime?: number
}

export interface ExtractedEntities {
  names?: string[]
  emails?: string[]
  phones?: string[]
  companies?: string[]
  dates?: string[]
  money?: string[]
  urls?: string[]
  custom?: Record<string, any>
}

// ==================== MCP TYPES ====================

export interface MCPManifest {
  name: string
  version: string
  protocol_version: string
  capabilities: MCPCapabilities
  tools: MCPTool[]
  resources: MCPResource[]
}

export interface MCPCapabilities {
  tools: boolean
  resources: boolean
  prompts: boolean
}

export interface MCPTool {
  name: string
  description: string
  inputSchema: any
}

export interface MCPResource {
  uri: string
  name: string
  description: string
  mimeType: string
}

export interface MCPSession {
  sessionToken: string
  agentId?: string
  agentType?: string
  capabilities: string[]
  expiresAt: string
}

// ==================== WEBHOOK TYPES ====================

export interface WebhookPayload {
  event: 'submission.created' | 'submission.updated' | 'form.created' | 'form.updated'
  timestamp: string
  form: {
    id: string
    name: string
  }
  submission?: {
    id: string
    data: Record<string, any>
    metadata: Record<string, any>
    ai?: AIProcessingResult
  }
}

export interface WebhookConfig {
  url: string
  secret?: string
  events?: string[]
  headers?: Record<string, string>
}

// ==================== API RESPONSE TYPES ====================

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

// ==================== EVENT TYPES ====================

export type EventType =
  | 'submit'
  | 'submit:success'
  | 'submit:error'
  | 'validate'
  | 'validate:error'

export interface EventPayload {
  type: EventType
  data?: any
  error?: any
  timestamp: number
}

export type EventHandler = (payload: EventPayload) => void
