/**
 * Form Builder Field Types - Enhanced for Phase 6b
 * 
 * Adds support for:
 * - Multi-step forms
 * - Conditional logic
 * - Advanced validation
 */

import {
  Type,
  Mail,
  Phone,
  Hash,
  Calendar,
  Clock,
  Link,
  FileText,
  Upload,
  CheckSquare,
  Circle,
  ChevronDown,
  ToggleLeft,
  Star,
  MapPin,
  Palette,
  AlignLeft,
  Heading,
  Minus,
  Image,
  Globe,
  DollarSign,
  Percent,
  List,
  Grid,
  MessageSquare,
  type LucideIcon
} from 'lucide-react'

export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'url'
  | 'textarea'
  | 'password'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'toggle'
  | 'multi-select'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'image'
  | 'signature'
  | 'rating'
  | 'slider'
  | 'color'
  | 'address'
  | 'country'
  | 'currency'
  | 'heading'
  | 'paragraph'
  | 'divider'
  | 'spacer'
  | 'hidden'
  | 'page-break' // New for multi-step

export interface FieldTypeDefinition {
  type: FieldType
  label: string
  icon: LucideIcon
  category: 'text' | 'selection' | 'datetime' | 'special' | 'layout' | 'advanced'
  description: string
  defaultConfig: Partial<FormField>
  validations?: string[]
}

// Conditional Logic Types
export type ConditionalOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than' 
  | 'less_than'
  | 'greater_equal'
  | 'less_equal'
  | 'is_empty'
  | 'is_not_empty'
  | 'is_checked'
  | 'is_not_checked'

export type ConditionalAction = 'show' | 'hide' | 'require' | 'skip_to'

export interface ConditionalRule {
  id: string
  field: string // Field ID to check
  operator: ConditionalOperator
  value?: string | number | boolean
}

export interface ConditionalLogic {
  enabled: boolean
  action: ConditionalAction
  logicType: 'all' | 'any' // AND or OR
  rules: ConditionalRule[]
  targetStep?: number // For skip_to action
}

// Validation Types
export interface ValidationRule {
  type: 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom'
  value?: string | number
  message: string
}

export interface FormField {
  id: string
  type: FieldType
  label: string
  name: string
  placeholder?: string
  helpText?: string
  required: boolean
  
  // Validation
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
    customMessage?: string
    rules?: ValidationRule[]
  }
  
  // Options for select/radio/checkbox
  options?: { label: string; value: string }[]
  
  // Conditional Logic
  conditional?: ConditionalLogic
  
  // Layout
  width?: 'full' | 'half' | 'third'
  
  // Type-specific config
  config?: Record<string, unknown>
  
  // Multi-step - which step this field belongs to
  stepIndex?: number
}

// Multi-step Form Types
export interface FormStep {
  id: string
  title: string
  description?: string
  fields: string[] // Field IDs in this step
}

export interface FormSchema {
  id: string
  name: string
  description?: string
  fields: FormField[]
  
  // Multi-step configuration
  isMultiStep: boolean
  steps: FormStep[]
  
  settings: FormSettings
  theme: FormTheme
}

export interface FormSettings {
  submitButtonText: string
  successMessage: string
  redirectUrl?: string
  requireAuth: boolean
  honeypotEnabled: boolean
  aiSpamProtection: boolean
  notifications: {
    email: boolean
    emailTo?: string[]
  }
  
  // Multi-step settings
  multiStep?: {
    showProgressBar: boolean
    showStepNumbers: boolean
    allowBackNavigation: boolean
    saveProgress: boolean
    nextButtonText: string
    prevButtonText: string
    completeButtonText: string
  }
}

export interface FormTheme {
  primaryColor: string
  backgroundColor: string
  textColor: string
  borderRadius: 'none' | 'small' | 'medium' | 'large'
  fontFamily: string
  fontSize: 'small' | 'medium' | 'large'
  labelPosition: 'top' | 'left' | 'floating'
  spacing: 'compact' | 'normal' | 'relaxed'
  
  // Progress bar theming
  progressBarStyle?: 'bar' | 'steps' | 'dots'
  progressBarColor?: string
}

// Field type definitions
export const FIELD_TYPES: Record<FieldType, FieldTypeDefinition> = {
  // Text inputs
  text: {
    type: 'text',
    label: 'Text Input',
    icon: Type,
    category: 'text',
    description: 'Single line text input',
    defaultConfig: {
      label: 'Text Field',
      placeholder: 'Enter text...',
      required: false,
    },
    validations: ['minLength', 'maxLength', 'pattern']
  },
  email: {
    type: 'email',
    label: 'Email',
    icon: Mail,
    category: 'text',
    description: 'Email address with validation',
    defaultConfig: {
      label: 'Email',
      placeholder: 'you@example.com',
      required: false,
    },
    validations: ['pattern']
  },
  phone: {
    type: 'phone',
    label: 'Phone',
    icon: Phone,
    category: 'text',
    description: 'Phone number input',
    defaultConfig: {
      label: 'Phone',
      placeholder: '+1 (555) 000-0000',
      required: false,
    },
    validations: ['pattern']
  },
  number: {
    type: 'number',
    label: 'Number',
    icon: Hash,
    category: 'text',
    description: 'Numeric input',
    defaultConfig: {
      label: 'Number',
      placeholder: '0',
      required: false,
    },
    validations: ['min', 'max']
  },
  url: {
    type: 'url',
    label: 'URL',
    icon: Link,
    category: 'text',
    description: 'Website URL input',
    defaultConfig: {
      label: 'Website',
      placeholder: 'https://example.com',
      required: false,
    },
    validations: ['pattern']
  },
  textarea: {
    type: 'textarea',
    label: 'Long Text',
    icon: AlignLeft,
    category: 'text',
    description: 'Multi-line text area',
    defaultConfig: {
      label: 'Message',
      placeholder: 'Enter your message...',
      required: false,
      config: { rows: 4 }
    },
    validations: ['minLength', 'maxLength']
  },
  password: {
    type: 'password',
    label: 'Password',
    icon: Type,
    category: 'text',
    description: 'Masked password input',
    defaultConfig: {
      label: 'Password',
      placeholder: '••••••••',
      required: false,
    },
    validations: ['minLength', 'pattern']
  },

  // Selection
  select: {
    type: 'select',
    label: 'Dropdown',
    icon: ChevronDown,
    category: 'selection',
    description: 'Dropdown select menu',
    defaultConfig: {
      label: 'Select',
      placeholder: 'Choose an option',
      required: false,
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
      ]
    }
  },
  radio: {
    type: 'radio',
    label: 'Radio Group',
    icon: Circle,
    category: 'selection',
    description: 'Single selection from options',
    defaultConfig: {
      label: 'Choose one',
      required: false,
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
      ]
    }
  },
  checkbox: {
    type: 'checkbox',
    label: 'Checkboxes',
    icon: CheckSquare,
    category: 'selection',
    description: 'Multiple selection checkboxes',
    defaultConfig: {
      label: 'Select all that apply',
      required: false,
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
      ]
    }
  },
  toggle: {
    type: 'toggle',
    label: 'Toggle',
    icon: ToggleLeft,
    category: 'selection',
    description: 'On/off toggle switch',
    defaultConfig: {
      label: 'Enable feature',
      required: false,
    }
  },
  'multi-select': {
    type: 'multi-select',
    label: 'Multi Select',
    icon: List,
    category: 'selection',
    description: 'Select multiple options from dropdown',
    defaultConfig: {
      label: 'Select multiple',
      placeholder: 'Choose options',
      required: false,
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
      ]
    }
  },

  // Date & Time
  date: {
    type: 'date',
    label: 'Date',
    icon: Calendar,
    category: 'datetime',
    description: 'Date picker',
    defaultConfig: {
      label: 'Date',
      required: false,
    }
  },
  time: {
    type: 'time',
    label: 'Time',
    icon: Clock,
    category: 'datetime',
    description: 'Time picker',
    defaultConfig: {
      label: 'Time',
      required: false,
    }
  },
  datetime: {
    type: 'datetime',
    label: 'Date & Time',
    icon: Calendar,
    category: 'datetime',
    description: 'Combined date and time picker',
    defaultConfig: {
      label: 'Date & Time',
      required: false,
    }
  },

  // Special inputs
  file: {
    type: 'file',
    label: 'File Upload',
    icon: Upload,
    category: 'special',
    description: 'Upload files',
    defaultConfig: {
      label: 'Upload File',
      required: false,
      config: {
        accept: '*/*',
        maxSize: 10485760,
        multiple: false
      }
    }
  },
  image: {
    type: 'image',
    label: 'Image Upload',
    icon: Image,
    category: 'special',
    description: 'Upload images with preview',
    defaultConfig: {
      label: 'Upload Image',
      required: false,
      config: {
        accept: 'image/*',
        maxSize: 5242880,
        multiple: false
      }
    }
  },
  signature: {
    type: 'signature',
    label: 'Signature',
    icon: FileText,
    category: 'special',
    description: 'Digital signature pad',
    defaultConfig: {
      label: 'Signature',
      required: false,
    }
  },
  rating: {
    type: 'rating',
    label: 'Rating',
    icon: Star,
    category: 'special',
    description: 'Star rating input',
    defaultConfig: {
      label: 'Rating',
      required: false,
      config: {
        maxRating: 5,
        allowHalf: false
      }
    }
  },
  slider: {
    type: 'slider',
    label: 'Slider',
    icon: Percent,
    category: 'special',
    description: 'Range slider input',
    defaultConfig: {
      label: 'Value',
      required: false,
      config: {
        min: 0,
        max: 100,
        step: 1
      }
    }
  },
  color: {
    type: 'color',
    label: 'Color Picker',
    icon: Palette,
    category: 'special',
    description: 'Color selection',
    defaultConfig: {
      label: 'Color',
      required: false,
      config: {
        defaultValue: '#6366f1'
      }
    }
  },

  // Address & Location
  address: {
    type: 'address',
    label: 'Address',
    icon: MapPin,
    category: 'advanced',
    description: 'Full address input',
    defaultConfig: {
      label: 'Address',
      required: false,
      config: {
        includeStreet2: true,
        includeCountry: true
      }
    }
  },
  country: {
    type: 'country',
    label: 'Country',
    icon: Globe,
    category: 'advanced',
    description: 'Country selector',
    defaultConfig: {
      label: 'Country',
      placeholder: 'Select country',
      required: false,
    }
  },

  // Payment
  currency: {
    type: 'currency',
    label: 'Currency',
    icon: DollarSign,
    category: 'advanced',
    description: 'Currency/money input',
    defaultConfig: {
      label: 'Amount',
      placeholder: '0.00',
      required: false,
      config: {
        currency: 'USD',
        symbol: '$'
      }
    }
  },

  // Layout elements
  heading: {
    type: 'heading',
    label: 'Heading',
    icon: Heading,
    category: 'layout',
    description: 'Section heading',
    defaultConfig: {
      label: 'Section Title',
      config: {
        level: 'h2',
        align: 'left'
      }
    }
  },
  paragraph: {
    type: 'paragraph',
    label: 'Paragraph',
    icon: MessageSquare,
    category: 'layout',
    description: 'Descriptive text',
    defaultConfig: {
      label: '',
      config: {
        content: 'Add descriptive text here...'
      }
    }
  },
  divider: {
    type: 'divider',
    label: 'Divider',
    icon: Minus,
    category: 'layout',
    description: 'Horizontal line separator',
    defaultConfig: {
      label: '',
    }
  },
  spacer: {
    type: 'spacer',
    label: 'Spacer',
    icon: Grid,
    category: 'layout',
    description: 'Add vertical spacing',
    defaultConfig: {
      label: '',
      config: {
        height: 24
      }
    }
  },
  'page-break': {
    type: 'page-break',
    label: 'Page Break',
    icon: FileText,
    category: 'layout',
    description: 'Create a new step/page',
    defaultConfig: {
      label: 'New Step',
      config: {
        stepTitle: 'Step',
        stepDescription: ''
      }
    }
  },

  // Hidden
  hidden: {
    type: 'hidden',
    label: 'Hidden Field',
    icon: Type,
    category: 'advanced',
    description: 'Hidden input field',
    defaultConfig: {
      label: 'hidden_field',
      config: {
        value: ''
      }
    }
  }
}

// Group field types by category
export const FIELD_CATEGORIES = {
  text: {
    label: 'Text Inputs',
    fields: ['text', 'email', 'phone', 'number', 'url', 'textarea'] as FieldType[]
  },
  selection: {
    label: 'Selection',
    fields: ['select', 'radio', 'checkbox', 'toggle', 'multi-select'] as FieldType[]
  },
  datetime: {
    label: 'Date & Time',
    fields: ['date', 'time', 'datetime'] as FieldType[]
  },
  special: {
    label: 'Special',
    fields: ['file', 'image', 'signature', 'rating', 'slider', 'color'] as FieldType[]
  },
  layout: {
    label: 'Layout',
    fields: ['heading', 'paragraph', 'divider', 'spacer', 'page-break'] as FieldType[]
  },
  advanced: {
    label: 'Advanced',
    fields: ['address', 'country', 'currency', 'hidden'] as FieldType[]
  }
}

// Conditional operators
export const CONDITIONAL_OPERATORS: Record<ConditionalOperator, { label: string; valueRequired: boolean }> = {
  equals: { label: 'Equals', valueRequired: true },
  not_equals: { label: 'Does not equal', valueRequired: true },
  contains: { label: 'Contains', valueRequired: true },
  not_contains: { label: 'Does not contain', valueRequired: true },
  starts_with: { label: 'Starts with', valueRequired: true },
  ends_with: { label: 'Ends with', valueRequired: true },
  greater_than: { label: 'Greater than', valueRequired: true },
  less_than: { label: 'Less than', valueRequired: true },
  greater_equal: { label: 'Greater than or equal', valueRequired: true },
  less_equal: { label: 'Less than or equal', valueRequired: true },
  is_empty: { label: 'Is empty', valueRequired: false },
  is_not_empty: { label: 'Is not empty', valueRequired: false },
  is_checked: { label: 'Is checked', valueRequired: false },
  is_not_checked: { label: 'Is not checked', valueRequired: false },
}

// Default form settings
export const DEFAULT_FORM_SETTINGS: FormSettings = {
  submitButtonText: 'Submit',
  successMessage: 'Thank you for your submission!',
  requireAuth: false,
  honeypotEnabled: true,
  aiSpamProtection: true,
  notifications: {
    email: true,
    emailTo: []
  },
  multiStep: {
    showProgressBar: true,
    showStepNumbers: true,
    allowBackNavigation: true,
    saveProgress: false,
    nextButtonText: 'Next',
    prevButtonText: 'Back',
    completeButtonText: 'Submit'
  }
}

// Default form theme
export const DEFAULT_FORM_THEME: FormTheme = {
  primaryColor: '#6366f1',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderRadius: 'medium',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 'medium',
  labelPosition: 'top',
  spacing: 'normal',
  progressBarStyle: 'steps',
  progressBarColor: '#6366f1'
}

// Helper functions
export function generateFieldId(): string {
  return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateStepId(): string {
  return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateRuleId(): string {
  return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateFieldName(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    || 'field'
}

export function createField(type: FieldType, stepIndex: number = 0): FormField {
  const definition = FIELD_TYPES[type]
  const id = generateFieldId()
  const name = generateFieldName(definition.defaultConfig.label || type)
  
  return {
    id,
    type,
    name,
    required: false,
    stepIndex,
    ...definition.defaultConfig
  } as FormField
}

export function createStep(title: string, index: number): FormStep {
  return {
    id: generateStepId(),
    title: title || `Step ${index + 1}`,
    description: '',
    fields: []
  }
}

export function createConditionalRule(fieldId: string): ConditionalRule {
  return {
    id: generateRuleId(),
    field: fieldId,
    operator: 'equals',
    value: ''
  }
}

export function createDefaultConditional(): ConditionalLogic {
  return {
    enabled: false,
    action: 'show',
    logicType: 'all',
    rules: []
  }
}

// Evaluate conditional logic
export function evaluateConditional(
  conditional: ConditionalLogic,
  formData: Record<string, unknown>,
  fields: FormField[]
): boolean {
  if (!conditional.enabled || conditional.rules.length === 0) {
    return true // No conditions = always show
  }

  const results = conditional.rules.map(rule => {
    const field = fields.find(f => f.id === rule.field)
    if (!field) return true

    const value = formData[field.name]
    
    switch (rule.operator) {
      case 'equals':
        return value === rule.value
      case 'not_equals':
        return value !== rule.value
      case 'contains':
        return String(value || '').toLowerCase().includes(String(rule.value || '').toLowerCase())
      case 'not_contains':
        return !String(value || '').toLowerCase().includes(String(rule.value || '').toLowerCase())
      case 'starts_with':
        return String(value || '').toLowerCase().startsWith(String(rule.value || '').toLowerCase())
      case 'ends_with':
        return String(value || '').toLowerCase().endsWith(String(rule.value || '').toLowerCase())
      case 'greater_than':
        return Number(value) > Number(rule.value)
      case 'less_than':
        return Number(value) < Number(rule.value)
      case 'greater_equal':
        return Number(value) >= Number(rule.value)
      case 'less_equal':
        return Number(value) <= Number(rule.value)
      case 'is_empty':
        return !value || value === ''
      case 'is_not_empty':
        return !!value && value !== ''
      case 'is_checked':
        return value === true
      case 'is_not_checked':
        return value !== true
      default:
        return true
    }
  })

  const shouldShow = conditional.logicType === 'all'
    ? results.every(r => r)
    : results.some(r => r)

  return conditional.action === 'show' ? shouldShow : !shouldShow
}
