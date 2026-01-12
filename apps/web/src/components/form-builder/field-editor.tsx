'use client'

import { useState } from 'react'
import { 
  Settings, 
  ChevronDown,
  Plus,
  Trash2,
  GripVertical,
  GitBranch
} from 'lucide-react'
import { FIELD_TYPES, FormField } from './field-types'
import { useBuilder } from './builder-context'
import { ConditionalLogicEditor } from './conditional-logic-editor'

type EditorTab = 'field' | 'settings' | 'theme'

export function FieldEditor() {
  const { state, getSelectedField, updateField, updateSettings, updateTheme, updateStep } = useBuilder()
  const [activeTab, setActiveTab] = useState<EditorTab>('field')
  const [editingConditional, setEditingConditional] = useState(false)
  
  const selectedField = getSelectedField()
  const currentStep = state.schema.steps[state.activeStepIndex]

  return (
    <div className="w-80 bg-white border-l flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('field')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'field'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Field
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'theme'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Theme
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'field' && (
          selectedField ? (
            <>
              <FieldProperties 
                field={selectedField} 
                onUpdate={updates => updateField(selectedField.id, updates)}
                onOpenConditional={() => setEditingConditional(true)}
              />
              {editingConditional && (
                <ConditionalLogicEditor
                  field={selectedField}
                  onClose={() => setEditingConditional(false)}
                />
              )}
            </>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No field selected</p>
              <p className="text-sm mt-1">Click a field to edit its properties</p>
            </div>
          )
        )}
        
        {activeTab === 'settings' && (
          <FormSettingsEditor 
            settings={state.schema.settings}
            onUpdate={updateSettings}
            isMultiStep={state.schema.isMultiStep}
            currentStep={currentStep}
            onUpdateStep={(updates) => updateStep(state.activeStepIndex, updates)}
          />
        )}
        
        {activeTab === 'theme' && (
          <ThemeEditor 
            theme={state.schema.theme}
            onUpdate={updateTheme}
            isMultiStep={state.schema.isMultiStep}
          />
        )}
      </div>
    </div>
  )
}

// Field Properties Editor
interface FieldPropertiesProps {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
  onOpenConditional: () => void
}

function FieldProperties({ field, onUpdate, onOpenConditional }: FieldPropertiesProps) {
  const definition = FIELD_TYPES[field.type]
  const Icon = definition.icon
  const [showValidation, setShowValidation] = useState(false)

  const isLayoutElement = ['heading', 'paragraph', 'divider', 'spacer', 'page-break'].includes(field.type)
  const hasConditional = field.conditional?.enabled && field.conditional.rules.length > 0

  return (
    <div className="p-4 space-y-4">
      {/* Field Type Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1">
          <div className="font-medium">{definition.label}</div>
          <div className="text-xs text-gray-500">{definition.description}</div>
        </div>
      </div>

      {/* Conditional Logic Button */}
      {!isLayoutElement && (
        <button
          onClick={onOpenConditional}
          className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
            hasConditional
              ? 'border-purple-200 bg-purple-50 text-purple-700'
              : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            <span className="font-medium text-sm">Conditional Logic</span>
          </div>
          {hasConditional ? (
            <span className="text-xs bg-purple-200 px-2 py-0.5 rounded-full">
              {field.conditional!.rules.length} rule{field.conditional!.rules.length > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-xs text-gray-400">Add rules</span>
          )}
        </button>
      )}

      {/* Basic Properties */}
      {!isLayoutElement && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
            <input
              type="text"
              value={field.label}
              onChange={e => onUpdate({ label: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
            <input
              type="text"
              value={field.name}
              onChange={e => onUpdate({ name: e.target.value.replace(/[^a-z0-9_]/gi, '_').toLowerCase() })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
            />
          </div>

          {['text', 'email', 'phone', 'number', 'url', 'textarea', 'select', 'password'].includes(field.type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={e => onUpdate({ placeholder: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Help Text</label>
            <input
              type="text"
              value={field.helpText || ''}
              onChange={e => onUpdate({ helpText: e.target.value })}
              placeholder="Additional instructions"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.required}
              onChange={e => onUpdate({ required: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Required field</span>
          </label>
        </>
      )}

      {/* Layout Element Content */}
      {field.type === 'heading' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading Text</label>
            <input
              type="text"
              value={field.label}
              onChange={e => onUpdate({ label: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select
              value={field.config?.level || 'h2'}
              onChange={e => onUpdate({ config: { ...field.config, level: e.target.value } })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="h1">H1 - Large</option>
              <option value="h2">H2 - Medium</option>
              <option value="h3">H3 - Small</option>
            </select>
          </div>
        </>
      )}

      {field.type === 'paragraph' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            value={field.config?.content || ''}
            onChange={e => onUpdate({ config: { ...field.config, content: e.target.value } })}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Options for select/radio/checkbox */}
      {['select', 'radio', 'checkbox', 'multi-select'].includes(field.type) && field.options && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
          <div className="space-y-2">
            {field.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                <input
                  type="text"
                  value={option.label}
                  onChange={e => {
                    const newOptions = [...field.options!]
                    newOptions[index] = { 
                      ...option, 
                      label: e.target.value,
                      value: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_')
                    }
                    onUpdate({ options: newOptions })
                  }}
                  placeholder="Option label"
                  className="flex-1 px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => {
                    const newOptions = field.options!.filter((_, i) => i !== index)
                    onUpdate({ options: newOptions })
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              const newOptions = [...(field.options || []), { label: '', value: '' }]
              onUpdate({ options: newOptions })
            }}
            className="mt-2 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Add option
          </button>
        </div>
      )}

      {/* Type-specific config */}
      {field.type === 'rating' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Rating</label>
          <select
            value={field.config?.maxRating || 5}
            onChange={e => onUpdate({ config: { ...field.config, maxRating: parseInt(e.target.value) } })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value={3}>3 stars</option>
            <option value={5}>5 stars</option>
            <option value={10}>10 stars</option>
          </select>
        </div>
      )}

      {field.type === 'slider' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min</label>
              <input
                type="number"
                value={field.config?.min || 0}
                onChange={e => onUpdate({ config: { ...field.config, min: parseInt(e.target.value) || 0 } })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max</label>
              <input
                type="number"
                value={field.config?.max || 100}
                onChange={e => onUpdate({ config: { ...field.config, max: parseInt(e.target.value) || 100 } })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Validation Section */}
      {!isLayoutElement && definition.validations && definition.validations.length > 0 && (
        <div className="border-t pt-4">
          <button
            onClick={() => setShowValidation(!showValidation)}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
          >
            Validation Rules
            <ChevronDown className={`w-4 h-4 transition-transform ${showValidation ? 'rotate-180' : ''}`} />
          </button>
          
          {showValidation && (
            <div className="mt-3 space-y-3">
              {definition.validations.includes('minLength') && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Min Length</label>
                  <input
                    type="number"
                    value={field.validation?.minLength || ''}
                    onChange={e => onUpdate({ validation: { ...field.validation, minLength: parseInt(e.target.value) || undefined } })}
                    placeholder="No minimum"
                    className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
              {definition.validations.includes('maxLength') && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max Length</label>
                  <input
                    type="number"
                    value={field.validation?.maxLength || ''}
                    onChange={e => onUpdate({ validation: { ...field.validation, maxLength: parseInt(e.target.value) || undefined } })}
                    placeholder="No maximum"
                    className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
              {definition.validations.includes('min') && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Min Value</label>
                  <input
                    type="number"
                    value={field.validation?.min || ''}
                    onChange={e => onUpdate({ validation: { ...field.validation, min: parseInt(e.target.value) || undefined } })}
                    placeholder="No minimum"
                    className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
              {definition.validations.includes('max') && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max Value</label>
                  <input
                    type="number"
                    value={field.validation?.max || ''}
                    onChange={e => onUpdate({ validation: { ...field.validation, max: parseInt(e.target.value) || undefined } })}
                    placeholder="No maximum"
                    className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
              {definition.validations.includes('pattern') && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Pattern (Regex)</label>
                  <input
                    type="text"
                    value={field.validation?.pattern || ''}
                    onChange={e => onUpdate({ validation: { ...field.validation, pattern: e.target.value || undefined } })}
                    placeholder="e.g., ^[A-Z].*"
                    className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Width */}
      {!isLayoutElement && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
          <select
            value={field.width || 'full'}
            onChange={e => onUpdate({ width: e.target.value as FormField['width'] })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="full">Full width</option>
            <option value="half">Half width</option>
            <option value="third">One third</option>
          </select>
        </div>
      )}
    </div>
  )
}

// Form Settings Editor
interface FormSettingsEditorProps {
  settings: import('./field-types').FormSettings
  onUpdate: (settings: Partial<import('./field-types').FormSettings>) => void
  isMultiStep: boolean
  currentStep?: import('./field-types').FormStep
  onUpdateStep?: (updates: Partial<import('./field-types').FormStep>) => void
}

function FormSettingsEditor({ settings, onUpdate, isMultiStep, currentStep, onUpdateStep }: FormSettingsEditorProps) {
  return (
    <div className="p-4 space-y-4">
      {/* Step Settings (if multi-step) */}
      {isMultiStep && currentStep && onUpdateStep && (
        <div className="pb-4 border-b">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Current Step</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Step Title</label>
              <input
                type="text"
                value={currentStep.title}
                onChange={e => onUpdateStep({ title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Step Description</label>
              <input
                type="text"
                value={currentStep.description || ''}
                onChange={e => onUpdateStep({ description: e.target.value })}
                placeholder="Optional description"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Multi-step Settings */}
      {isMultiStep && (
        <div className="pb-4 border-b">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Multi-Step Settings</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.multiStep?.showProgressBar ?? true}
                onChange={e => onUpdate({ 
                  multiStep: { ...settings.multiStep, showProgressBar: e.target.checked } 
                })}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span className="text-sm text-gray-700">Show progress bar</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.multiStep?.allowBackNavigation ?? true}
                onChange={e => onUpdate({ 
                  multiStep: { ...settings.multiStep, allowBackNavigation: e.target.checked } 
                })}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span className="text-sm text-gray-700">Allow back navigation</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Button Text</label>
              <input
                type="text"
                value={settings.multiStep?.nextButtonText || 'Next'}
                onChange={e => onUpdate({ multiStep: { ...settings.multiStep, nextButtonText: e.target.value } })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Back Button Text</label>
              <input
                type="text"
                value={settings.multiStep?.prevButtonText || 'Back'}
                onChange={e => onUpdate({ multiStep: { ...settings.multiStep, prevButtonText: e.target.value } })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Submit Button Text</label>
        <input
          type="text"
          value={isMultiStep ? (settings.multiStep?.completeButtonText || 'Submit') : settings.submitButtonText}
          onChange={e => isMultiStep 
            ? onUpdate({ multiStep: { ...settings.multiStep, completeButtonText: e.target.value } })
            : onUpdate({ submitButtonText: e.target.value })
          }
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Success Message</label>
        <textarea
          value={settings.successMessage}
          onChange={e => onUpdate({ successMessage: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URL</label>
        <input
          type="url"
          value={settings.redirectUrl || ''}
          onChange={e => onUpdate({ redirectUrl: e.target.value || undefined })}
          placeholder="https://example.com/thank-you"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="pt-4 border-t space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.honeypotEnabled}
            onChange={e => onUpdate({ honeypotEnabled: e.target.checked })}
            className="w-4 h-4 rounded text-indigo-600"
          />
          <span className="text-sm text-gray-700">Enable honeypot (spam protection)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.aiSpamProtection}
            onChange={e => onUpdate({ aiSpamProtection: e.target.checked })}
            className="w-4 h-4 rounded text-indigo-600"
          />
          <span className="text-sm text-gray-700">AI spam protection</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.notifications.email}
            onChange={e => onUpdate({ notifications: { ...settings.notifications, email: e.target.checked } })}
            className="w-4 h-4 rounded text-indigo-600"
          />
          <span className="text-sm text-gray-700">Email notifications</span>
        </label>
      </div>
    </div>
  )
}

// Theme Editor
interface ThemeEditorProps {
  theme: import('./field-types').FormTheme
  onUpdate: (theme: Partial<import('./field-types').FormTheme>) => void
  isMultiStep: boolean
}

function ThemeEditor({ theme, onUpdate, isMultiStep }: ThemeEditorProps) {
  const presetColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
    '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#1f2937',
  ]

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {presetColors.map(color => (
            <button
              key={color}
              onClick={() => onUpdate({ primaryColor: color })}
              className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                theme.primaryColor === color ? 'border-gray-900 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <input
          type="color"
          value={theme.primaryColor}
          onChange={e => onUpdate({ primaryColor: e.target.value })}
          className="w-full h-10 rounded-lg cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
        <input
          type="color"
          value={theme.backgroundColor}
          onChange={e => onUpdate({ backgroundColor: e.target.value })}
          className="w-full h-10 rounded-lg cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius</label>
        <select
          value={theme.borderRadius}
          onChange={e => onUpdate({ borderRadius: e.target.value as typeof theme.borderRadius })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="none">None</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
        <select
          value={theme.fontSize}
          onChange={e => onUpdate({ fontSize: e.target.value as typeof theme.fontSize })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Spacing</label>
        <select
          value={theme.spacing}
          onChange={e => onUpdate({ spacing: e.target.value as typeof theme.spacing })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="compact">Compact</option>
          <option value="normal">Normal</option>
          <option value="relaxed">Relaxed</option>
        </select>
      </div>

      {/* Progress Bar Style (if multi-step) */}
      {isMultiStep && (
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Progress Bar</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
            <select
              value={theme.progressBarStyle || 'steps'}
              onChange={e => onUpdate({ progressBarStyle: e.target.value as typeof theme.progressBarStyle })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="bar">Progress Bar</option>
              <option value="steps">Step Indicators</option>
              <option value="dots">Dots</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
