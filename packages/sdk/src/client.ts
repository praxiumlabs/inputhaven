import type {
  InputHavenConfig,
  SubmissionData,
  SubmissionOptions,
  SubmissionResult,
  Form,
  FormSchema,
  FieldDefinition,
  UFPSchema,
  UFPField,
  Template,
  SemanticType,
  MCPManifest,
  MCPSession,
  APIResponse,
  PaginationParams,
  EventHandler,
  EventPayload,
  EventType
} from './types.js'

const DEFAULT_BASE_URL = 'https://api.inputhaven.com'
const DEFAULT_TIMEOUT = 30000

/**
 * Normalized field for validation - internal use only
 */
interface NormalizedValidationField {
  name: string
  type: string
  required: boolean
  format?: string
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  enum?: string[]
  pattern?: string
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors?: string[]
}

/**
 * InputHaven SDK Client
 * 
 * @example
 * ```typescript
 * import { InputHaven } from '@inputhaven/sdk'
 * 
 * const client = new InputHaven({ apiKey: 'your-api-key' })
 * 
 * // Submit a form
 * const result = await client.submit('form-id', {
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   message: 'Hello!'
 * })
 * ```
 */
export class InputHaven {
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly timeout: number
  private readonly debug: boolean
  private readonly customFetch: typeof fetch
  private readonly eventHandlers: Map<EventType, Set<EventHandler>> = new Map()

  constructor(config: InputHavenConfig) {
    if (!config.apiKey) {
      throw new Error('InputHaven: apiKey is required')
    }

    this.apiKey = config.apiKey
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '')
    this.timeout = config.timeout || DEFAULT_TIMEOUT
    this.debug = config.debug || false
    this.customFetch = config.fetch || globalThis.fetch
  }

  // ==================== FORM SUBMISSION ====================

  /**
   * Submit data to a form
   * 
   * @example
   * ```typescript
   * const result = await client.submit('contact-form', {
   *   name: 'John',
   *   email: 'john@example.com',
   *   message: 'Hello!'
   * })
   * 
   * if (result.success) {
   *   console.log('Submitted:', result.submissionId)
   * }
   * ```
   */
  async submit(
    formIdOrAccessKey: string,
    data: SubmissionData,
    options: SubmissionOptions = {}
  ): Promise<SubmissionResult> {
    this.emit('submit', { formId: formIdOrAccessKey, data })

    try {
      const payload: Record<string, unknown> = {
        access_key: formIdOrAccessKey,
        ...data,
        _meta: {
          sdk: '@inputhaven/sdk',
          version: '1.0.0',
          skipSpamCheck: options.skipSpamCheck,
          skipAiProcessing: options.skipAiProcessing,
          ...options.metadata
        }
      }

      if (options.honeypot) {
        payload._gotcha = options.honeypot
      }

      const response = await this.request<SubmissionResult>('/v1/submit', {
        method: 'POST',
        body: payload
      })

      if (response.success) {
        this.emit('submit:success', response)
      } else {
        this.emit('submit:error', response.error)
      }

      return {
        success: response.success,
        submissionId: response.data?.submissionId,
        message: response.data?.message,
        processingTime: response.data?.processingTime,
        error: response.error
      }

    } catch (error) {
      const errorResult: SubmissionResult = {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error'
        }
      }
      this.emit('submit:error', errorResult.error)
      return errorResult
    }
  }

  /**
   * Submit using UFP protocol (with schema validation)
   */
  async submitUFP(
    formId: string,
    data: SubmissionData,
    options: SubmissionOptions = {}
  ): Promise<SubmissionResult> {
    // First validate against schema
    const schema = await this.getFormSchema(formId)
    if (schema) {
      const validation = this.validateAgainstUFPSchema(data, schema)
      if (!validation.valid) {
        this.emit('validate:error', validation.errors)
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Validation failed: ${validation.errors?.join(', ')}`
          }
        }
      }
    }

    const response = await this.request<SubmissionResult>('/v1/ufp/submit', {
      method: 'POST',
      body: { form_id: formId, data, ...options }
    })

    return {
      success: response.success,
      submissionId: response.data?.submissionId,
      message: response.data?.message,
      processingTime: response.data?.processingTime,
      error: response.error
    }
  }

  // ==================== FORMS ====================

  /**
   * Get all forms in workspace
   */
  async getForms(params?: PaginationParams): Promise<APIResponse<Form[]>> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))

    return this.request<Form[]>(`/v1/forms?${query}`)
  }

  /**
   * Get a single form by ID
   */
  async getForm(formId: string): Promise<APIResponse<Form>> {
    return this.request<Form>(`/v1/forms/${formId}`)
  }

  /**
   * Get form schema (UFP format)
   */
  async getFormSchema(formId: string): Promise<UFPSchema | null> {
    try {
      const response = await this.request<UFPSchema>(`/v1/ufp/forms/${formId}/schema`)
      return response.success && response.data ? response.data : null
    } catch {
      return null
    }
  }

  // ==================== VALIDATION ====================

  /**
   * Validate data against UFP schema
   */
  validateAgainstUFPSchema(data: SubmissionData, schema: UFPSchema): ValidationResult {
    const normalizedFields: NormalizedValidationField[] = schema.fields.map((field: UFPField) => ({
      name: field.name,
      type: field.type,
      required: field.required,
      format: field.validation?.format,
      minLength: field.validation?.minLength,
      maxLength: field.validation?.maxLength,
      min: field.validation?.min,
      max: field.validation?.max,
      enum: field.validation?.enum,
      pattern: field.validation?.pattern
    }))

    return this.validateNormalizedFields(data, normalizedFields)
  }

  /**
   * Validate data against FormSchema
   */
  validateAgainstFormSchema(data: SubmissionData, schema: FormSchema): ValidationResult {
    const fieldEntries = Object.entries(schema.fields) as [string, FieldDefinition][]
    const normalizedFields: NormalizedValidationField[] = fieldEntries.map(
      ([name, field]) => ({
        name,
        type: field.type,
        required: field.required || schema.required?.includes(name) || false,
        format: field.format,
        minLength: field.minLength,
        maxLength: field.maxLength,
        min: field.minimum,
        max: field.maximum,
        enum: field.enum,
        pattern: field.pattern
      })
    )

    return this.validateNormalizedFields(data, normalizedFields)
  }

  /**
   * Validate data - auto-detects schema type
   */
  validateData(data: SubmissionData, schema: UFPSchema | FormSchema): ValidationResult {
    // Detect schema type by checking for UFP-specific properties
    if ('ufp_version' in schema && 'submission_url' in schema) {
      return this.validateAgainstUFPSchema(data, schema as UFPSchema)
    }
    return this.validateAgainstFormSchema(data, schema as FormSchema)
  }

  /**
   * Internal validation against normalized fields
   */
  private validateNormalizedFields(
    data: SubmissionData,
    fields: NormalizedValidationField[]
  ): ValidationResult {
    const errors: string[] = []

    for (const field of fields) {
      const value = data[field.name]

      // Required check
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field.name} is required`)
        continue
      }

      // Skip further validation if value is empty and not required
      if (value === undefined || value === null || value === '') {
        continue
      }

      // Type validation
      if (field.type === 'number' && typeof value !== 'number') {
        errors.push(`${field.name} must be a number`)
      }
      if (field.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${field.name} must be a boolean`)
      }
      if (field.type === 'string' && typeof value !== 'string') {
        errors.push(`${field.name} must be a string`)
      }

      // String validations (only if value is a string)
      if (typeof value === 'string') {
        // Email format
        if (field.format === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            errors.push(`${field.name} must be a valid email address`)
          }
        }

        // URL format
        if (field.format === 'url' || field.format === 'uri') {
          try {
            new URL(value)
          } catch {
            errors.push(`${field.name} must be a valid URL`)
          }
        }

        // Min length
        if (field.minLength !== undefined && value.length < field.minLength) {
          errors.push(`${field.name} must be at least ${field.minLength} characters`)
        }

        // Max length
        if (field.maxLength !== undefined && value.length > field.maxLength) {
          errors.push(`${field.name} must be at most ${field.maxLength} characters`)
        }

        // Pattern
        if (field.pattern) {
          const regex = new RegExp(field.pattern)
          if (!regex.test(value)) {
            errors.push(`${field.name} format is invalid`)
          }
        }

        // Enum
        if (field.enum && field.enum.length > 0 && !field.enum.includes(value)) {
          errors.push(`${field.name} must be one of: ${field.enum.join(', ')}`)
        }
      }

      // Number validations (only if value is a number)
      if (typeof value === 'number') {
        if (field.min !== undefined && value < field.min) {
          errors.push(`${field.name} must be at least ${field.min}`)
        }
        if (field.max !== undefined && value > field.max) {
          errors.push(`${field.name} must be at most ${field.max}`)
        }
      }
    }

    const result: ValidationResult = {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    }

    this.emit('validate', result)
    return result
  }

  // ==================== TEMPLATES ====================

  /**
   * Get available templates
   */
  async getTemplates(options?: {
    type?: string
    category?: string
    includeSystem?: boolean
    includePublic?: boolean
  }): Promise<APIResponse<Template[]>> {
    const query = new URLSearchParams()
    if (options?.type) query.set('type', options.type)
    if (options?.category) query.set('category', options.category)
    if (options?.includeSystem) query.set('includeSystem', 'true')
    if (options?.includePublic) query.set('includePublic', 'true')

    return this.request<Template[]>(`/v1/templates?${query}`)
  }

  /**
   * Get a template by ID
   */
  async getTemplate(templateId: string): Promise<APIResponse<Template>> {
    return this.request<Template>(`/v1/templates/${templateId}`)
  }

  // ==================== SEMANTIC TYPES ====================

  /**
   * Get all semantic types
   */
  async getSemanticTypes(namespace?: string): Promise<APIResponse<SemanticType[]>> {
    const path = namespace ? `/v1/ufp/types/${namespace}` : '/v1/ufp/types'
    return this.request<SemanticType[]>(path)
  }

  // ==================== MCP (AI AGENT) ====================

  /**
   * Get MCP manifest for AI agents
   */
  async getMCPManifest(): Promise<MCPManifest | null> {
    try {
      const response = await this.request<MCPManifest>('/mcp/v1/manifest', {
        skipAuth: true
      })
      return response.success && response.data ? response.data : null
    } catch {
      return null
    }
  }

  /**
   * Create MCP session for AI agent
   */
  async createMCPSession(options?: {
    agentId?: string
    agentType?: string
    capabilities?: string[]
  }): Promise<APIResponse<MCPSession>> {
    return this.request<MCPSession>('/mcp/v1/sessions', {
      method: 'POST',
      body: options
    })
  }

  // ==================== DISCOVERY ====================

  /**
   * Discover UFP endpoints
   */
  async discover(): Promise<APIResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>('/.well-known/ufp.json', { skipAuth: true })
  }

  // ==================== EVENTS ====================

  /**
   * Subscribe to events
   */
  on(event: EventType, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    const handlers = this.eventHandlers.get(event)!
    handlers.add(handler)

    // Return unsubscribe function
    return () => {
      handlers.delete(handler)
    }
  }

  /**
   * Emit an event
   */
  private emit(type: EventType, data?: unknown): void {
    const payload: EventPayload = { type, data, timestamp: Date.now() }
    const handlers = this.eventHandlers.get(type)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload)
        } catch (e) {
          this.log('error', 'Event handler error:', e)
        }
      })
    }
  }

  // ==================== HTTP CLIENT ====================

  private async request<T>(
    path: string,
    options: {
      method?: string
      body?: unknown
      headers?: Record<string, string>
      skipAuth?: boolean
    } = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${path}`
    const method = options.method || 'GET'

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': '@inputhaven/sdk/1.0.0',
      ...options.headers
    }

    if (!options.skipAuth) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    this.log('debug', `${method} ${url}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await this.customFetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const responseData = await response.json() as APIResponse<T>

      if (!response.ok) {
        return {
          success: false,
          error: responseData.error || {
            code: `HTTP_${response.status}`,
            message: response.statusText
          }
        }
      }

      return responseData

    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: { code: 'TIMEOUT', message: 'Request timed out' }
        }
      }

      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }

  private log(level: string, ...args: unknown[]): void {
    if (this.debug) {
      console.log(`[InputHaven:${level}]`, ...args)
    }
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Quick submit helper - one-liner form submission
 * 
 * @example
 * ```typescript
 * import { submit } from '@inputhaven/sdk'
 * 
 * await submit('form-access-key', {
 *   name: 'John',
 *   email: 'john@example.com'
 * })
 * ```
 */
export async function submit(
  accessKey: string,
  data: SubmissionData,
  options?: {
    baseUrl?: string
    timeout?: number
  }
): Promise<SubmissionResult> {
  const baseUrl = options?.baseUrl || DEFAULT_BASE_URL
  const timeout = options?.timeout || DEFAULT_TIMEOUT

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(`${baseUrl}/v1/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': '@inputhaven/sdk/1.0.0'
      },
      body: JSON.stringify({ access_key: accessKey, ...data }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    const result = await response.json() as SubmissionResult
    return result

  } catch (error) {
    clearTimeout(timeoutId)
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error'
      }
    }
  }
}

/**
 * Create a form handler for HTML forms
 * 
 * @example
 * ```typescript
 * import { createFormHandler } from '@inputhaven/sdk'
 * 
 * const handler = createFormHandler('form-access-key')
 * document.querySelector('form').addEventListener('submit', handler)
 * ```
 */
export function createFormHandler(
  accessKey: string,
  options?: {
    baseUrl?: string
    onSuccess?: (result: SubmissionResult) => void
    onError?: (error: { code: string; message: string }) => void
    preventDefault?: boolean
  }
): (event: Event) => Promise<void> {
  return async (event: Event): Promise<void> => {
    if (options?.preventDefault !== false) {
      event.preventDefault()
    }

    const form = event.target as HTMLFormElement
    const formData = new FormData(form)
    const data: SubmissionData = {}

    formData.forEach((value, key) => {
      if (!key.startsWith('_')) {
        data[key] = value
      }
    })

    try {
      const result = await submit(accessKey, data, { baseUrl: options?.baseUrl })
      
      if (result.success) {
        options?.onSuccess?.(result)
      } else if (result.error) {
        options?.onError?.(result.error)
      }
    } catch (error) {
      options?.onError?.({
        code: 'ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
