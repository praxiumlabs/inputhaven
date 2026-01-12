# @inputhaven/react

Official React Components for InputHaven - Drop-in form components with built-in submission handling

[![npm version](https://badge.fury.io/js/@inputhaven%2Freact.svg)](https://www.npmjs.com/package/@inputhaven/react)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Installation

```bash
npm install @inputhaven/react
# or
yarn add @inputhaven/react
# or
pnpm add @inputhaven/react
```

## Quick Start

### Simple Form (No API Key Required)

```tsx
import { Form, Input, Textarea, Submit, FormStatus, Honeypot } from '@inputhaven/react'

function ContactForm() {
  return (
    <Form 
      formId="your-form-access-key"
      onSuccess={() => console.log('Submitted!')}
    >
      <Honeypot />
      
      <Input name="name" label="Name" required />
      <Input name="email" type="email" label="Email" required />
      <Textarea name="message" label="Message" />
      
      <Submit>Send Message</Submit>
      <FormStatus />
    </Form>
  )
}
```

### With `useForm` Hook

```tsx
import { useForm } from '@inputhaven/react'

function CustomForm() {
  const { register, handleSubmit, isSubmitting, error } = useForm({
    formId: 'contact-form',
    onSuccess: (result) => {
      console.log('Submitted:', result.submissionId)
    }
  })

  return (
    <form onSubmit={handleSubmit}>
      <input {...register('name')} placeholder="Name" />
      <input {...register('email')} type="email" placeholder="Email" />
      <textarea {...register('message')} placeholder="Message" />
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send'}
      </button>
      
      {error && <p className="error">{error.message}</p>}
    </form>
  )
}
```

### With API Key (Provider)

For advanced features like schema validation and templates:

```tsx
import { InputHavenProvider, Form, Input, Submit } from '@inputhaven/react'

function App() {
  return (
    <InputHavenProvider apiKey="your-api-key">
      <ContactForm />
    </InputHavenProvider>
  )
}

function ContactForm() {
  return (
    <Form formId="contact-form" resetOnSuccess>
      <Input name="email" type="email" required />
      <Submit>Subscribe</Submit>
    </Form>
  )
}
```

## Components

### `<Form>`

Container component that handles form submission.

```tsx
<Form
  formId="your-form-id"        // Required: Form ID or access key
  onSuccess={(result) => {}}   // Optional: Success callback
  onError={(error) => {}}      // Optional: Error callback
  resetOnSuccess={true}        // Optional: Reset form after success
  baseUrl="https://..."        // Optional: Custom API URL
>
  {children}
</Form>
```

**Render Prop Pattern:**

```tsx
<Form formId="contact">
  {({ register, isSubmitting, result, error }) => (
    <>
      <input {...register('email')} />
      <button disabled={isSubmitting}>Submit</button>
      {result?.success && <p>Thanks!</p>}
    </>
  )}
</Form>
```

### `<Input>`

Auto-registered input field.

```tsx
<Input
  name="email"           // Required: Field name
  label="Email Address"  // Optional: Label text
  type="email"           // Optional: Input type
  required               // Optional: Required field
/>
```

### `<Textarea>`

Auto-registered textarea field.

```tsx
<Textarea
  name="message"
  label="Your Message"
  rows={5}
/>
```

### `<Select>`

Auto-registered select field.

```tsx
<Select
  name="category"
  label="Category"
  options={[
    { value: 'support', label: 'Support' },
    { value: 'sales', label: 'Sales' },
    { value: 'other', label: 'Other' }
  ]}
/>
```

### `<Submit>`

Submit button with loading state.

```tsx
<Submit loadingText="Sending...">
  Submit
</Submit>
```

### `<Honeypot>`

Hidden spam protection field.

```tsx
<Honeypot name="_gotcha" />
```

### `<FormStatus>`

Display success/error messages.

```tsx
<FormStatus
  successMessage="Thank you!"
  errorMessage="Something went wrong"
/>

// Or with custom rendering
<FormStatus
  renderSuccess={(result) => <p>ID: {result.submissionId}</p>}
  renderError={(error) => <p className="error">{error.message}</p>}
/>
```

## Hooks

### `useForm`

Full control over form state and submission.

```tsx
const {
  submit,        // (data?) => Promise<SubmissionResult>
  isSubmitting,  // boolean
  result,        // SubmissionResult | null
  error,         // any
  schema,        // UFPSchema | null (if using provider)
  reset,         // () => void
  register,      // (name) => { name, value, onChange }
  values,        // Record<string, any>
  setValue,      // (name, value) => void
  handleSubmit   // (event?) => Promise<void>
} = useForm({
  formId: 'form-id',
  onSuccess: (result) => {},
  onError: (error) => {},
  resetOnSuccess: true,
  baseUrl: 'https://...'
})
```

### `useInputHaven`

Access the InputHaven client (requires Provider).

```tsx
function MyComponent() {
  const client = useInputHaven()
  
  // Use client methods
  const templates = await client?.getTemplates()
}
```

## Styling

Components render minimal HTML without default styles. Add your own CSS:

```css
/* Example styles */
.form-success {
  padding: 1rem;
  background: #d4edda;
  color: #155724;
  border-radius: 4px;
}

.form-error {
  padding: 1rem;
  background: #f8d7da;
  color: #721c24;
  border-radius: 4px;
}

input, textarea, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button[type="submit"] {
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
```

## TypeScript

Full TypeScript support:

```tsx
import type {
  UseFormOptions,
  UseFormReturn,
  FormProps,
  InputProps,
  SubmissionResult
} from '@inputhaven/react'
```

## Server Components

For Next.js App Router, use the `'use client'` directive:

```tsx
'use client'

import { Form, Input, Submit } from '@inputhaven/react'

export function ContactForm() {
  return (
    <Form formId="contact">
      <Input name="email" />
      <Submit>Send</Submit>
    </Form>
  )
}
```

## License

MIT
