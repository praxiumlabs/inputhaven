/**
 * @inputhaven/sdk - Official InputHaven SDK
 * 
 * Universal Form Protocol - The standard for AI-native form handling
 * 
 * @example Quick Start
 * ```typescript
 * import { InputHaven } from '@inputhaven/sdk'
 * 
 * const client = new InputHaven({ apiKey: 'your-api-key' })
 * 
 * // Submit a form
 * await client.submit('form-id', {
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * })
 * ```
 * 
 * @example One-liner submission
 * ```typescript
 * import { submit } from '@inputhaven/sdk'
 * 
 * await submit('form-access-key', { name: 'John', email: 'john@test.com' })
 * ```
 * 
 * @packageDocumentation
 */

// Main client
export { InputHaven } from './client.js'
export type { ValidationResult } from './client.js'

// Helper functions
export { submit, createFormHandler } from './client.js'

// All types
export type {
  // Config
  InputHavenConfig,
  FormConfig,
  
  // Submission
  SubmissionData,
  SubmissionOptions,
  SubmissionResult,
  
  // Forms
  Form,
  FormSchema,
  FieldDefinition,
  
  // UFP
  UFPSchema,
  UFPField,
  UFPValidation,
  UFPCapabilities,
  
  // Semantic Types
  SemanticType,
  SemanticTypeRegistry,
  
  // Templates
  Template,
  TemplateType,
  
  // AI
  AIProcessingResult,
  ExtractedEntities,
  
  // MCP
  MCPManifest,
  MCPCapabilities,
  MCPTool,
  MCPResource,
  MCPSession,
  
  // Webhooks
  WebhookPayload,
  WebhookConfig,
  
  // API
  APIResponse,
  PaginationParams,
  
  // Events
  EventType,
  EventPayload,
  EventHandler
} from './types.js'

// Version
export const VERSION = '1.0.0'
