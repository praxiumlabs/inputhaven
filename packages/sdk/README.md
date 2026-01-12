# @inputhaven/sdk

Official JavaScript/TypeScript SDK for InputHaven - Universal Form Protocol

[![npm version](https://badge.fury.io/js/@inputhaven%2Fsdk.svg)](https://www.npmjs.com/package/@inputhaven/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Installation

```bash
npm install @inputhaven/sdk
# or
yarn add @inputhaven/sdk
# or
pnpm add @inputhaven/sdk
```

## Quick Start

### One-liner Submission (No API Key Required)

```typescript
import { submit } from '@inputhaven/sdk'

// Submit with just access key (from your form)
const result = await submit('your-form-access-key', {
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Hello!'
})

if (result.success) {
  console.log('Submitted!', result.submissionId)
}
```

### Full Client (API Key Required)

```typescript
import { InputHaven } from '@inputhaven/sdk'

const client = new InputHaven({
  apiKey: 'your-api-key'
})

// Submit a form
const result = await client.submit('form-id', {
  name: 'John Doe',
  email: 'john@example.com'
})

// Get form schema
const schema = await client.getFormSchema('form-id')

// List all forms
const forms = await client.getForms()
```

## Usage Examples

### HTML Form Handler

```typescript
import { createFormHandler } from '@inputhaven/sdk'

const handler = createFormHandler('your-access-key', {
  onSuccess: (result) => {
    alert('Thank you for your submission!')
  },
  onError: (error) => {
    alert('Something went wrong: ' + error.message)
  }
})

document.querySelector('#my-form').addEventListener('submit', handler)
```

### With Validation

```typescript
const client = new InputHaven({ apiKey: 'xxx' })

// Get schema first
const schema = await client.getFormSchema('contact-form')

// Validate data before submitting
const data = { name: 'John', email: 'invalid-email' }
const validation = client.validateData(data, schema)

if (!validation.valid) {
  console.error('Validation errors:', validation.errors)
} else {
  await client.submit('contact-form', data)
}
```

### Event Handling

```typescript
const client = new InputHaven({ apiKey: 'xxx' })

// Subscribe to events
const unsubscribe = client.on('submit:success', (payload) => {
  console.log('Submission successful:', payload.data)
})

// Later: unsubscribe
unsubscribe()
```

### UFP Protocol Submission

```typescript
// UFP submission with automatic schema validation
const result = await client.submitUFP('form-id', {
  name: 'John',
  email: 'john@example.com'
})
```

### Get Semantic Types

```typescript
// Get all semantic types
const types = await client.getSemanticTypes()

// Get types for a specific namespace
const personTypes = await client.getSemanticTypes('person')
// Returns: person.full_name, person.email, person.phone, etc.
```

### Templates

```typescript
// Get available templates
const templates = await client.getTemplates({
  type: 'FORM_SCHEMA',
  category: 'contact',
  includeSystem: true
})

// Get specific template
const template = await client.getTemplate('template-id')
```

### MCP (AI Agent Integration)

```typescript
// Get MCP manifest (for AI agent discovery)
const manifest = await client.getMCPManifest()

// Create MCP session for AI agent
const session = await client.createMCPSession({
  agentId: 'my-ai-agent',
  agentType: 'claude',
  capabilities: ['submit', 'query']
})
```

## API Reference

### `InputHaven` Class

#### Constructor

```typescript
new InputHaven(config: InputHavenConfig)
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | required | Your InputHaven API key |
| `baseUrl` | `string` | `https://api.inputhaven.com` | API base URL |
| `timeout` | `number` | `30000` | Request timeout in ms |
| `debug` | `boolean` | `false` | Enable debug logging |

#### Methods

| Method | Description |
|--------|-------------|
| `submit(formId, data, options?)` | Submit data to a form |
| `submitUFP(formId, data, options?)` | Submit with UFP validation |
| `getForms(params?)` | Get all forms |
| `getForm(formId)` | Get a single form |
| `getFormSchema(formId)` | Get form schema (UFP format) |
| `validateData(data, schema)` | Validate data against schema |
| `getTemplates(options?)` | Get available templates |
| `getTemplate(templateId)` | Get a template |
| `getSemanticTypes(namespace?)` | Get semantic types |
| `getMCPManifest()` | Get MCP manifest |
| `createMCPSession(options?)` | Create MCP session |
| `discover()` | Get UFP discovery info |
| `on(event, handler)` | Subscribe to events |

### Helper Functions

#### `submit(accessKey, data, options?)`

One-liner form submission without API key:

```typescript
import { submit } from '@inputhaven/sdk'

await submit('access-key', { name: 'John' })
```

#### `createFormHandler(accessKey, options?)`

Create event handler for HTML forms:

```typescript
import { createFormHandler } from '@inputhaven/sdk'

const handler = createFormHandler('access-key', {
  onSuccess: (result) => console.log('Success!'),
  onError: (error) => console.error('Error:', error)
})

form.addEventListener('submit', handler)
```

## TypeScript Support

Full TypeScript support with comprehensive types:

```typescript
import type {
  InputHavenConfig,
  SubmissionData,
  SubmissionResult,
  Form,
  FormSchema,
  UFPSchema,
  Template,
  SemanticType
} from '@inputhaven/sdk'
```

## Browser Support

Works in all modern browsers and Node.js 18+.

For older browsers, you may need to polyfill `fetch`.

## Error Handling

```typescript
const result = await client.submit('form-id', data)

if (!result.success) {
  switch (result.error?.code) {
    case 'VALIDATION_ERROR':
      console.log('Invalid data:', result.error.message)
      break
    case 'RATE_LIMITED':
      console.log('Too many requests')
      break
    case 'NETWORK_ERROR':
      console.log('Network issue')
      break
    default:
      console.log('Error:', result.error?.message)
  }
}
```

## Self-Hosted

For self-hosted InputHaven instances:

```typescript
const client = new InputHaven({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.your-domain.com'
})
```

## License

MIT
