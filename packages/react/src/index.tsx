'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  forwardRef
} from 'react'
import type {
  ReactNode,
  FormEvent,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  FormHTMLAttributes,
  Dispatch,
  SetStateAction
} from 'react'

// ==================== TYPES ====================
// These match @inputhaven/sdk types for compatibility

export interface InputHavenConfig {
  apiKey: string
  baseUrl?: string
  timeout?: number
  debug?: boolean
}

export interface SubmissionData {
  [key: string]: unknown
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

export interface UFPField {
  name: string
  type: string
  title: string
  description?: string
  required: boolean
  semantic_type?: string
  validation?: {
    format?: string
    pattern?: string
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    enum?: string[]
  }
  ai_hints?: Record<string, unknown>
}

export interface UFPSchema {
  ufp_version: string
  form_id: string
  form_name: string
  description?: string
  fields: UFPField[]
  submission_url: string
  capabilities: {
    ai_processing: boolean
    file_upload: boolean
    webhooks: boolean
    auto_response: boolean
  }
}

// ==================== SDK CLIENT (MINIMAL) ====================

const DEFAULT_BASE_URL = 'https://api.inputhaven.com'
const DEFAULT_TIMEOUT = 30000

/**
 * Minimal InputHaven client for React
 */
class InputHavenClient {
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly timeout: number

  constructor(config: InputHavenConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '')
    this.timeout = config.timeout || DEFAULT_TIMEOUT
  }

  async submit(formId: string, data: SubmissionData): Promise<SubmissionResult> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseUrl}/v1/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': '@inputhaven/react/1.0.0'
        },
        body: JSON.stringify({ access_key: formId, ...data }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return await response.json() as SubmissionResult
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

  async getFormSchema(formId: string): Promise<UFPSchema | null> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/ufp/forms/${formId}/schema`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })
      const data = await response.json() as { success: boolean; data?: UFPSchema }
      return data.success && data.data ? data.data : null
    } catch {
      return null
    }
  }
}

/**
 * Simple submit without API key
 */
async function simpleSubmit(
  accessKey: string,
  data: SubmissionData,
  baseUrl?: string
): Promise<SubmissionResult> {
  const url = baseUrl || DEFAULT_BASE_URL

  try {
    const response = await fetch(`${url}/v1/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': '@inputhaven/react/1.0.0'
      },
      body: JSON.stringify({ access_key: accessKey, ...data })
    })

    return await response.json() as SubmissionResult
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error'
      }
    }
  }
}

// ==================== CONTEXT ====================

interface InputHavenContextValue {
  client: InputHavenClient | null
}

const InputHavenContext = createContext<InputHavenContextValue>({
  client: null
})

/**
 * InputHaven Provider - Wrap your app to enable SDK features
 * 
 * @example
 * ```tsx
 * <InputHavenProvider apiKey="your-api-key">
 *   <App />
 * </InputHavenProvider>
 * ```
 */
export function InputHavenProvider({
  children,
  apiKey,
  baseUrl,
  timeout,
  debug
}: {
  children: ReactNode
  apiKey?: string
  baseUrl?: string
  timeout?: number
  debug?: boolean
}): JSX.Element {
  const client = useMemo(() => {
    if (!apiKey) return null
    return new InputHavenClient({ apiKey, baseUrl, timeout, debug })
  }, [apiKey, baseUrl, timeout, debug])

  return (
    <InputHavenContext.Provider value={{ client }}>
      {children}
    </InputHavenContext.Provider>
  )
}

/**
 * Hook to access InputHaven client
 */
export function useInputHaven(): InputHavenClient | null {
  const { client } = useContext(InputHavenContext)
  return client
}

// ==================== FORM HOOK ====================

export interface UseFormOptions {
  formId: string
  onSuccess?: (result: SubmissionResult) => void
  onError?: (error: { code: string; message: string }) => void
  resetOnSuccess?: boolean
  baseUrl?: string
}

export interface UseFormReturn {
  submit: (data?: SubmissionData) => Promise<SubmissionResult>
  isSubmitting: boolean
  result: SubmissionResult | null
  error: { code: string; message: string } | null
  schema: UFPSchema | null
  reset: () => void
  register: (name: string) => {
    name: string
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
    value: unknown
  }
  values: SubmissionData
  setValue: (name: string, value: unknown) => void
  handleSubmit: (e?: FormEvent) => Promise<void>
}

/**
 * Hook for form management and submission
 */
export function useForm(options: UseFormOptions): UseFormReturn {
  const client = useInputHaven()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<SubmissionResult | null>(null)
  const [error, setError] = useState<{ code: string; message: string } | null>(null)
  const [schema, setSchema] = useState<UFPSchema | null>(null)
  const [values, setValues] = useState<SubmissionData>({})

  // Load schema if we have a client
  useEffect(() => {
    if (client && options.formId) {
      client.getFormSchema(options.formId).then(setSchema).catch(() => {})
    }
  }, [client, options.formId])

  const setValue = useCallback((name: string, value: unknown) => {
    setValues((prev: SubmissionData) => ({ ...prev, [name]: value }))
  }, [])

  const register = useCallback((name: string) => ({
    name,
    value: values[name] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = e.target
      const newValue = target.type === 'checkbox' 
        ? (target as HTMLInputElement).checked 
        : target.value
      setValue(name, newValue)
    }
  }), [values, setValue])

  const reset = useCallback(() => {
    setValues({})
    setResult(null)
    setError(null)
  }, [])

  const submit = useCallback(async (data?: SubmissionData): Promise<SubmissionResult> => {
    setIsSubmitting(true)
    setError(null)

    const submitData = data || values

    try {
      let submitResult: SubmissionResult

      if (client) {
        submitResult = await client.submit(options.formId, submitData)
      } else {
        submitResult = await simpleSubmit(options.formId, submitData, options.baseUrl)
      }

      setResult(submitResult)

      if (submitResult.success) {
        options.onSuccess?.(submitResult)
        if (options.resetOnSuccess !== false) {
          setValues({})
        }
      } else if (submitResult.error) {
        setError(submitResult.error)
        options.onError?.(submitResult.error)
      }

      return submitResult
    } catch (err) {
      const errorObj = {
        code: 'ERROR',
        message: err instanceof Error ? err.message : 'Unknown error'
      }
      setError(errorObj)
      options.onError?.(errorObj)
      return { success: false, error: errorObj }
    } finally {
      setIsSubmitting(false)
    }
  }, [client, options, values])

  const handleSubmit = useCallback(async (e?: FormEvent) => {
    e?.preventDefault()
    await submit()
  }, [submit])

  return {
    submit,
    isSubmitting,
    result,
    error,
    schema,
    reset,
    register,
    values,
    setValue,
    handleSubmit
  }
}

// ==================== FORM CONTEXT ====================

const FormContext = createContext<UseFormReturn | null>(null)

function useFormContext(): UseFormReturn {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('Form components must be used within a <Form> component')
  }
  return context
}

// ==================== FORM COMPONENT ====================

type BaseFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children' | 'onError'>

export interface FormProps extends BaseFormProps {
  formId: string
  onSuccess?: (result: SubmissionResult) => void
  onError?: (error: { code: string; message: string }) => void
  resetOnSuccess?: boolean
  baseUrl?: string
  children: ReactNode | ((props: UseFormReturn) => ReactNode)
}

/**
 * Form component with built-in submission handling
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { formId, onSuccess, onError, resetOnSuccess, baseUrl, children, ...props },
  ref
) {
  const formState = useForm({ formId, onSuccess, onError, resetOnSuccess, baseUrl })

  return (
    <FormContext.Provider value={formState}>
      <form ref={ref} onSubmit={formState.handleSubmit} {...props}>
        {typeof children === 'function' ? children(formState) : children}
      </form>
    </FormContext.Provider>
  )
})

// ==================== INPUT COMPONENTS ====================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string
  label?: string
  error?: string
}

/**
 * Input component that auto-registers with Form
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { name, label, error, className, ...props },
  ref
) {
  const { register } = useFormContext()
  const registered = register(name)

  return (
    <div className={className}>
      {label && <label htmlFor={name}>{label}</label>}
      <input
        ref={ref}
        id={name}
        name={registered.name}
        value={registered.value as string}
        onChange={registered.onChange}
        {...props}
      />
      {error && <span className="error">{error}</span>}
    </div>
  )
})

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string
  label?: string
  error?: string
}

/**
 * Textarea component that auto-registers with Form
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { name, label, error, className, ...props },
  ref
) {
  const { register } = useFormContext()
  const registered = register(name)

  return (
    <div className={className}>
      {label && <label htmlFor={name}>{label}</label>}
      <textarea
        ref={ref}
        id={name}
        name={registered.name}
        value={registered.value as string}
        onChange={registered.onChange}
        {...props}
      />
      {error && <span className="error">{error}</span>}
    </div>
  )
})

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  name: string
  label?: string
  error?: string
  options: SelectOption[]
}

/**
 * Select component that auto-registers with Form
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { name, label, error, options, className, ...props },
  ref
) {
  const { register } = useFormContext()
  const registered = register(name)

  return (
    <div className={className}>
      {label && <label htmlFor={name}>{label}</label>}
      <select
        ref={ref}
        id={name}
        name={registered.name}
        value={registered.value as string}
        onChange={registered.onChange}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="error">{error}</span>}
    </div>
  )
})

// ==================== SUBMIT BUTTON ====================

export interface SubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loadingText?: string
}

/**
 * Submit button with loading state
 */
export const Submit = forwardRef<HTMLButtonElement, SubmitProps>(function Submit(
  { children, loadingText = 'Submitting...', disabled, ...props },
  ref
) {
  const { isSubmitting } = useFormContext()

  return (
    <button
      ref={ref}
      type="submit"
      disabled={disabled || isSubmitting}
      {...props}
    >
      {isSubmitting ? loadingText : children}
    </button>
  )
})

// ==================== UTILITY COMPONENTS ====================

export interface HoneypotProps {
  name?: string
}

/**
 * Hidden honeypot field for spam protection
 */
export function Honeypot({ name = '_gotcha' }: HoneypotProps): JSX.Element {
  return (
    <input
      type="text"
      name={name}
      style={{
        position: 'absolute',
        left: '-9999px',
        opacity: 0,
        pointerEvents: 'none'
      }}
      tabIndex={-1}
      autoComplete="off"
    />
  )
}

export interface FormStatusProps {
  successMessage?: string | ((result: SubmissionResult) => ReactNode)
  errorMessage?: string | ((error: { code: string; message: string }) => ReactNode)
  renderSuccess?: (result: SubmissionResult) => ReactNode
  renderError?: (error: { code: string; message: string }) => ReactNode
}

/**
 * Display form submission status
 */
export function FormStatus({
  successMessage = 'Thank you for your submission!',
  errorMessage,
  renderSuccess,
  renderError
}: FormStatusProps): JSX.Element | null {
  const { result, error } = useFormContext()

  if (result?.success) {
    if (renderSuccess) return <>{renderSuccess(result)}</>
    return (
      <div className="form-success">
        {typeof successMessage === 'function' ? successMessage(result) : successMessage}
      </div>
    )
  }

  if (error) {
    if (renderError) return <>{renderError(error)}</>
    const message = typeof errorMessage === 'function' 
      ? errorMessage(error) 
      : errorMessage || error.message || 'Something went wrong'
    return (
      <div className="form-error">
        {message}
      </div>
    )
  }

  return null
}
