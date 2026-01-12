'use client'

import { useState, useCallback } from 'react'
import { 
  Loader2, 
  Check, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Star,
  Upload,
  Calendar,
  Clock
} from 'lucide-react'

interface FormField {
  id: string
  type: string
  name: string
  label: string
  placeholder?: string
  helpText?: string
  required: boolean
  options?: { label: string; value: string }[]
  config?: Record<string, unknown>
  stepIndex?: number
  conditional?: {
    enabled: boolean
    action: string
    logicType: 'all' | 'any'
    rules: Array<{
      field: string
      operator: string
      value?: string | number | boolean
    }>
  }
}

interface FormSchema {
  fields: FormField[]
  isMultiStep: boolean
  steps: Array<{ id: string; title: string; description?: string; fields: string[] }>
  settings: {
    submitButtonText: string
    successMessage: string
    redirectUrl?: string
    multiStep?: {
      nextButtonText?: string
      prevButtonText?: string
      completeButtonText?: string
      showProgressBar?: boolean
      allowBackNavigation?: boolean
    }
  }
  theme: {
    primaryColor: string
    backgroundColor: string
    textColor: string
    borderRadius: string
    fontSize: string
    spacing: string
    progressBarStyle?: string
  }
}

interface Form {
  id: string
  name: string
  description?: string
  schema: FormSchema
}

interface FormRendererProps {
  form: Form
  embedded?: boolean
  themeOverride?: string
  onSuccess?: (data: Record<string, unknown>) => void
  onError?: (error: Error) => void
}

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error'

export function FormRenderer({ 
  form, 
  embedded = false,
  themeOverride,
  onSuccess,
  onError 
}: FormRendererProps) {
  const { schema } = form
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isMultiStep = schema.isMultiStep && schema.steps.length > 1
  const totalSteps = schema.steps.length

  // Get fields for current step
  const currentStepFields = schema.fields.filter(f => {
    if (!isMultiStep) return true
    return (f.stepIndex ?? 0) === currentStep
  })

  // Filter visible fields based on conditional logic
  const visibleFields = currentStepFields.filter(field => {
    if (!field.conditional?.enabled) return true
    return evaluateConditional(field.conditional, formData, schema.fields)
  })

  // Handle field change
  const handleChange = useCallback((name: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }, [errors])

  // Validate current step
  const validateStep = useCallback(() => {
    const stepErrors: Record<string, string> = {}
    
    visibleFields.forEach(field => {
      const value = formData[field.name]
      
      if (field.required && !value) {
        stepErrors[field.name] = `${field.label} is required`
      }
      
      // Email validation
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(String(value))) {
          stepErrors[field.name] = 'Please enter a valid email address'
        }
      }
      
      // Phone validation
      if (field.type === 'phone' && value) {
        const phoneRegex = /^[\d\s\-+()]{10,}$/
        if (!phoneRegex.test(String(value))) {
          stepErrors[field.name] = 'Please enter a valid phone number'
        }
      }
      
      // URL validation
      if (field.type === 'url' && value) {
        try {
          new URL(String(value))
        } catch {
          stepErrors[field.name] = 'Please enter a valid URL'
        }
      }
    })
    
    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }, [visibleFields, formData])

  // Handle next step
  const handleNext = useCallback(() => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1))
    }
  }, [validateStep, totalSteps])

  // Handle previous step
  const handlePrev = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep()) return
    
    setSubmissionState('submitting')
    setSubmitError(null)
    
    try {
      const response = await fetch(`/api/v1/submit/${form.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Submission failed')
      }
      
      setSubmissionState('success')
      onSuccess?.(formData)
      
      // Redirect if configured
      if (schema.settings.redirectUrl) {
        setTimeout(() => {
          window.location.href = schema.settings.redirectUrl!
        }, 1500)
      }
    } catch (error) {
      const err = error as Error
      setSubmissionState('error')
      setSubmitError(err.message)
      onError?.(err)
    }
  }, [validateStep, form.id, formData, schema.settings.redirectUrl, onSuccess, onError])

  // Success state
  if (submissionState === 'success') {
    return (
      <div className="text-center py-12">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${schema.theme.primaryColor}20` }}
        >
          <Check 
            className="w-8 h-8" 
            style={{ color: schema.theme.primaryColor }} 
          />
        </div>
        <h3 
          className="text-xl font-semibold mb-2"
          style={{ color: schema.theme.textColor }}
        >
          Success!
        </h3>
        <p className="text-gray-600">
          {schema.settings.successMessage}
        </p>
        {schema.settings.redirectUrl && (
          <p className="text-sm text-gray-400 mt-4">
            Redirecting...
          </p>
        )}
      </div>
    )
  }

  const borderRadiusValue = 
    schema.theme.borderRadius === 'none' ? '0' :
    schema.theme.borderRadius === 'small' ? '4px' :
    schema.theme.borderRadius === 'large' ? '12px' : '8px'

  const spacingClass = 
    schema.theme.spacing === 'compact' ? 'space-y-3' :
    schema.theme.spacing === 'relaxed' ? 'space-y-6' : 'space-y-4'

  return (
    <form onSubmit={handleSubmit} className={spacingClass}>
      {/* Progress bar for multi-step */}
      {isMultiStep && schema.settings.multiStep?.showProgressBar !== false && (
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          steps={schema.steps}
          style={schema.theme.progressBarStyle}
          color={schema.theme.primaryColor}
        />
      )}

      {/* Step title */}
      {isMultiStep && (
        <div className="mb-6">
          <h2 
            className="text-lg font-semibold"
            style={{ color: schema.theme.textColor }}
          >
            {schema.steps[currentStep]?.title}
          </h2>
          {schema.steps[currentStep]?.description && (
            <p className="text-sm text-gray-500 mt-1">
              {schema.steps[currentStep].description}
            </p>
          )}
        </div>
      )}

      {/* Fields */}
      {visibleFields.map(field => (
        <FieldRenderer
          key={field.id}
          field={field}
          value={formData[field.name]}
          onChange={value => handleChange(field.name, value)}
          error={errors[field.name]}
          theme={schema.theme}
          borderRadius={borderRadiusValue}
        />
      ))}

      {/* Error message */}
      {submissionState === 'error' && submitError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{submitError}</span>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-4">
        {isMultiStep && currentStep > 0 && schema.settings.multiStep?.allowBackNavigation !== false ? (
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-4 h-4" />
            {schema.settings.multiStep?.prevButtonText || 'Back'}
          </button>
        ) : (
          <div />
        )}

        {isMultiStep && currentStep < totalSteps - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1 px-6 py-3 text-white rounded-lg hover:opacity-90"
            style={{ 
              backgroundColor: schema.theme.primaryColor,
              borderRadius: borderRadiusValue
            }}
          >
            {schema.settings.multiStep?.nextButtonText || 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={submissionState === 'submitting'}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            style={{ 
              backgroundColor: schema.theme.primaryColor,
              borderRadius: borderRadiusValue,
              width: isMultiStep ? 'auto' : '100%',
              justifyContent: 'center'
            }}
          >
            {submissionState === 'submitting' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              isMultiStep 
                ? (schema.settings.multiStep?.completeButtonText || 'Submit')
                : schema.settings.submitButtonText
            )}
          </button>
        )}
      </div>
    </form>
  )
}

// Progress Indicator Component
function ProgressIndicator({
  currentStep,
  totalSteps,
  steps,
  style = 'steps',
  color
}: {
  currentStep: number
  totalSteps: number
  steps: Array<{ title: string }>
  style?: string
  color: string
}) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  if (style === 'bar') {
    return (
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300"
            style={{ width: `${progress}%`, backgroundColor: color }}
          />
        </div>
      </div>
    )
  }

  if (style === 'dots') {
    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentStep ? 'scale-125' : ''
            }`}
            style={{ 
              backgroundColor: index <= currentStep ? color : '#e5e7eb'
            }}
          />
        ))}
      </div>
    )
  }

  // Default: steps
  return (
    <div className="mb-6">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={index} className="flex-1 flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= currentStep ? 'text-white' : 'bg-gray-200 text-gray-500'
              }`}
              style={{
                backgroundColor: index <= currentStep ? color : undefined
              }}
            >
              {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2">
                <div 
                  className="h-full"
                  style={{ 
                    backgroundColor: index < currentStep ? color : '#e5e7eb'
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Field Renderer Component
function FieldRenderer({
  field,
  value,
  onChange,
  error,
  theme,
  borderRadius
}: {
  field: FormField
  value: unknown
  onChange: (value: unknown) => void
  error?: string
  theme: FormSchema['theme']
  borderRadius: string
}) {
  const { type, label, placeholder, helpText, required, options, config } = field

  // Layout elements
  if (type === 'heading') {
    return <h3 className="font-bold text-lg pt-4" style={{ color: theme.textColor }}>{label}</h3>
  }
  if (type === 'paragraph') {
    return <p className="text-gray-600">{config?.content as string}</p>
  }
  if (type === 'divider') {
    return <hr className="border-gray-200 my-4" />
  }
  if (type === 'spacer') {
    return <div style={{ height: (config?.height as number) || 24 }} />
  }

  const inputClasses = `w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 transition-colors ${
    error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
  }`

  return (
    <div>
      {label && type !== 'toggle' && (
        <label 
          className="block text-sm font-medium mb-1.5"
          style={{ color: theme.textColor }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Text inputs */}
      {['text', 'email', 'phone', 'number', 'url', 'password'].includes(type) && (
        <input
          type={type === 'phone' ? 'tel' : type}
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClasses}
          style={{ borderRadius }}
        />
      )}

      {/* Textarea */}
      {type === 'textarea' && (
        <textarea
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={(config?.rows as number) || 4}
          className={inputClasses}
          style={{ borderRadius }}
        />
      )}

      {/* Select */}
      {type === 'select' && (
        <select
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          className={inputClasses}
          style={{ borderRadius }}
        >
          <option value="">{placeholder || 'Select...'}</option>
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {/* Radio */}
      {type === 'radio' && (
        <div className="space-y-2">
          {options?.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field.name}
                value={opt.value}
                checked={value === opt.value}
                onChange={e => onChange(e.target.value)}
                className="w-4 h-4"
                style={{ accentColor: theme.primaryColor }}
              />
              <span style={{ color: theme.textColor }}>{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Checkbox */}
      {type === 'checkbox' && options && (
        <div className="space-y-2">
          {options.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Array.isArray(value) ? value.includes(opt.value) : false}
                onChange={e => {
                  const arr = Array.isArray(value) ? [...value] : []
                  if (e.target.checked) {
                    arr.push(opt.value)
                  } else {
                    const idx = arr.indexOf(opt.value)
                    if (idx > -1) arr.splice(idx, 1)
                  }
                  onChange(arr)
                }}
                className="w-4 h-4 rounded"
                style={{ accentColor: theme.primaryColor }}
              />
              <span style={{ color: theme.textColor }}>{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Toggle */}
      {type === 'toggle' && (
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={!!value}
            onClick={() => onChange(!value)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              value ? '' : 'bg-gray-200'
            }`}
            style={{ backgroundColor: value ? theme.primaryColor : undefined }}
          >
            <span 
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                value ? 'translate-x-5' : ''
              }`}
            />
          </button>
          <span style={{ color: theme.textColor }}>{label}</span>
        </label>
      )}

      {/* Rating */}
      {type === 'rating' && (
        <div className="flex gap-1">
          {[...Array((config?.maxRating as number) || 5)].map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i + 1)}
              className="text-2xl transition-colors"
              style={{ 
                color: i < (value as number || 0) ? '#fbbf24' : '#e5e7eb'
              }}
            >
              ★
            </button>
          ))}
        </div>
      )}

      {/* Date */}
      {type === 'date' && (
        <div className="relative">
          <input
            type="date"
            value={(value as string) || ''}
            onChange={e => onChange(e.target.value)}
            className={inputClasses}
            style={{ borderRadius }}
          />
        </div>
      )}

      {/* Time */}
      {type === 'time' && (
        <input
          type="time"
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          className={inputClasses}
          style={{ borderRadius }}
        />
      )}

      {/* File */}
      {(type === 'file' || type === 'image') && (
        <div 
          className="border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          style={{ borderRadius }}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">Click or drag to upload</p>
          <input
            type="file"
            accept={type === 'image' ? 'image/*' : (config?.accept as string) || '*/*'}
            onChange={e => onChange(e.target.files?.[0])}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      )}

      {/* Help text */}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}

      {/* Error */}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

// Evaluate conditional logic
function evaluateConditional(
  conditional: NonNullable<FormField['conditional']>,
  formData: Record<string, unknown>,
  fields: FormField[]
): boolean {
  if (!conditional.enabled || conditional.rules.length === 0) return true

  const results = conditional.rules.map(rule => {
    const field = fields.find(f => f.id === rule.field)
    if (!field) return true

    const value = formData[field.name]

    switch (rule.operator) {
      case 'equals': return value === rule.value
      case 'not_equals': return value !== rule.value
      case 'contains': return String(value || '').toLowerCase().includes(String(rule.value || '').toLowerCase())
      case 'is_empty': return !value || value === ''
      case 'is_not_empty': return !!value && value !== ''
      case 'is_checked': return value === true
      case 'is_not_checked': return value !== true
      case 'greater_than': return Number(value) > Number(rule.value)
      case 'less_than': return Number(value) < Number(rule.value)
      default: return true
    }
  })

  const shouldShow = conditional.logicType === 'all'
    ? results.every(r => r)
    : results.some(r => r)

  return conditional.action === 'show' ? shouldShow : !shouldShow
}
