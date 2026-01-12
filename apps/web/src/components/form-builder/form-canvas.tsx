'use client'

import { useState, useRef } from 'react'
import { 
  GripVertical, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown,
  MousePointer,
  GitBranch,
  Eye,
  EyeOff
} from 'lucide-react'
import { FIELD_TYPES, FormField, FieldType, evaluateConditional } from './field-types'
import { useBuilder } from './builder-context'
import { ConditionalBadge, ConditionalLogicEditor } from './conditional-logic-editor'
import { ProgressBar, StepButtons } from './step-navigation'

export function FormCanvas() {
  const { 
    state, 
    selectField, 
    removeField, 
    duplicateField, 
    reorderField, 
    addField,
    setDraggedField,
    getFieldsForStep,
    toggleConditionalEditor,
    setPreviewStep
  } = useBuilder()
  
  const { schema, selectedFieldId, previewMode, activeStepIndex, previewStepIndex, draggedFieldType } = state
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [editingConditionalField, setEditingConditionalField] = useState<FormField | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Get fields for current step
  const currentStepFields = getFieldsForStep(previewMode ? previewStepIndex : activeStepIndex)

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(null)
    
    const fieldType = e.dataTransfer.getData('fieldType') as FieldType
    if (fieldType && FIELD_TYPES[fieldType]) {
      addField(fieldType, index, activeStepIndex)
    }
    setDraggedField(null)
  }

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverIndex(null)
    
    const fieldType = e.dataTransfer.getData('fieldType') as FieldType
    if (fieldType && FIELD_TYPES[fieldType]) {
      addField(fieldType, undefined, activeStepIndex)
    }
    setDraggedField(null)
  }

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const openConditionalEditor = (field: FormField) => {
    setEditingConditionalField(field)
  }

  if (previewMode) {
    return (
      <FormPreview 
        currentStep={previewStepIndex}
        onStepChange={setPreviewStep}
      />
    )
  }

  return (
    <div 
      ref={canvasRef}
      className="flex-1 bg-gray-100 p-6 overflow-y-auto"
      onDragOver={handleCanvasDragOver}
      onDrop={handleCanvasDrop}
    >
      <div className="max-w-2xl mx-auto">
        {/* Form Header */}
        <div className="bg-white rounded-t-xl border-t border-x p-6">
          <input
            type="text"
            value={schema.name}
            onChange={() => {}}
            className="text-2xl font-bold w-full border-0 focus:ring-0 p-0 mb-2 focus:outline-none"
            placeholder="Form Title"
          />
          <input
            type="text"
            value={schema.description || ''}
            onChange={() => {}}
            className="text-gray-500 w-full border-0 focus:ring-0 p-0 focus:outline-none"
            placeholder="Form description (optional)"
          />
        </div>

        {/* Multi-step Progress (if enabled) */}
        {schema.isMultiStep && (
          <div className="bg-white border-x px-6 py-4">
            <div className="flex items-center gap-2">
              {schema.steps.map((step, i) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i === activeStepIndex
                      ? 'bg-indigo-600 text-white'
                      : i < activeStepIndex
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {i + 1}
                  </div>
                  {i < schema.steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-1 ${
                      i < activeStepIndex ? 'bg-indigo-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm font-medium text-indigo-600">
              Step {activeStepIndex + 1}: {schema.steps[activeStepIndex]?.title}
            </div>
          </div>
        )}

        {/* Fields */}
        <div className="bg-white border-x">
          {currentStepFields.length === 0 ? (
            <div 
              className={`p-12 text-center border-2 border-dashed mx-4 my-4 rounded-xl transition-colors ${
                draggedFieldType ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200'
              }`}
            >
              <MousePointer className={`w-8 h-8 mx-auto mb-3 ${
                draggedFieldType ? 'text-indigo-500' : 'text-gray-300'
              }`} />
              <p className={`font-medium ${
                draggedFieldType ? 'text-indigo-600' : 'text-gray-500'
              }`}>
                {draggedFieldType ? 'Drop field here' : 'Drag fields here'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Or click a field type from the palette
              </p>
            </div>
          ) : (
            <div className="px-4 py-2">
              {currentStepFields.map((field, index) => (
                <div key={field.id}>
                  {/* Drop zone before field */}
                  <div
                    onDragOver={e => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, index)}
                    className={`h-2 -my-1 transition-all ${
                      dragOverIndex === index 
                        ? 'h-16 bg-indigo-100 border-2 border-dashed border-indigo-400 rounded-lg my-2' 
                        : ''
                    }`}
                  />
                  
                  {/* Field */}
                  <FieldItem 
                    field={field}
                    index={index}
                    isSelected={selectedFieldId === field.id}
                    onSelect={() => selectField(field.id)}
                    onRemove={() => removeField(field.id)}
                    onDuplicate={() => duplicateField(field.id)}
                    onMoveUp={() => reorderField(index, Math.max(0, index - 1))}
                    onMoveDown={() => reorderField(index, Math.min(currentStepFields.length - 1, index + 1))}
                    onOpenConditional={() => openConditionalEditor(field)}
                    isFirst={index === 0}
                    isLast={index === currentStepFields.length - 1}
                  />
                </div>
              ))}
              
              {/* Drop zone at end */}
              <div
                onDragOver={e => handleDragOver(e, currentStepFields.length)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, currentStepFields.length)}
                className={`h-2 transition-all ${
                  dragOverIndex === currentStepFields.length 
                    ? 'h-16 bg-indigo-100 border-2 border-dashed border-indigo-400 rounded-lg mt-2' 
                    : ''
                }`}
              />
            </div>
          )}
        </div>

        {/* Submit Button Preview */}
        <div className="bg-white rounded-b-xl border-b border-x p-6">
          {schema.isMultiStep ? (
            <div className="flex justify-between">
              {activeStepIndex > 0 && (
                <button
                  type="button"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  {schema.settings.multiStep?.prevButtonText || 'Back'}
                </button>
              )}
              <button
                type="button"
                className="ml-auto py-3 px-6 rounded-lg font-medium text-white transition-colors"
                style={{ backgroundColor: schema.theme.primaryColor }}
              >
                {activeStepIndex === schema.steps.length - 1
                  ? (schema.settings.multiStep?.completeButtonText || 'Submit')
                  : (schema.settings.multiStep?.nextButtonText || 'Next')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="w-full py-3 rounded-lg font-medium text-white transition-colors"
              style={{ backgroundColor: schema.theme.primaryColor }}
            >
              {schema.settings.submitButtonText}
            </button>
          )}
        </div>
      </div>

      {/* Conditional Logic Editor Modal */}
      {editingConditionalField && (
        <ConditionalLogicEditor
          field={editingConditionalField}
          onClose={() => setEditingConditionalField(null)}
        />
      )}
    </div>
  )
}

// Field Item Component
interface FieldItemProps {
  field: FormField
  index: number
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
  onDuplicate: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onOpenConditional: () => void
  isFirst: boolean
  isLast: boolean
}

function FieldItem({
  field,
  index,
  isSelected,
  onSelect,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onOpenConditional,
  isFirst,
  isLast
}: FieldItemProps) {
  const definition = FIELD_TYPES[field.type]
  const Icon = definition.icon
  const hasConditional = field.conditional?.enabled && field.conditional.rules.length > 0

  return (
    <div
      onClick={onSelect}
      className={`group relative p-4 rounded-xl border-2 transition-all cursor-pointer my-2 ${
        isSelected 
          ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' 
          : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
      }`}
    >
      {/* Field Type Badge */}
      <div className="absolute -top-2 left-3 flex items-center gap-2">
        <span className="px-2 py-0.5 bg-white border rounded text-xs text-gray-500 flex items-center gap-1">
          <Icon className="w-3 h-3" />
          {definition.label}
          {field.required && <span className="text-red-500">*</span>}
        </span>
        <ConditionalBadge field={field} />
      </div>

      {/* Actions */}
      <div className={`absolute -top-2 right-3 flex items-center gap-1 bg-white border rounded-lg overflow-hidden ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      } transition-opacity`}>
        <button
          onClick={e => { e.stopPropagation(); onMoveUp(); }}
          disabled={isFirst}
          className="p-1.5 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move up"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onMoveDown(); }}
          disabled={isLast}
          className="p-1.5 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move down"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-gray-200" />
        <button
          onClick={e => { e.stopPropagation(); onOpenConditional(); }}
          className={`p-1.5 hover:bg-purple-100 ${hasConditional ? 'text-purple-600' : ''}`}
          title="Conditional logic"
        >
          <GitBranch className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDuplicate(); }}
          className="p-1.5 hover:bg-gray-100"
          title="Duplicate"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          className="p-1.5 hover:bg-red-100 text-red-600"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Field Preview */}
      <FieldPreview field={field} />
    </div>
  )
}

// Field Preview Component
function FieldPreview({ field }: { field: FormField }) {
  const { type, label, placeholder, helpText, options, config } = field

  // Layout elements
  if (type === 'heading') {
    const level = config?.level || 'h2'
    const Tag = level as keyof JSX.IntrinsicElements
    return <Tag className="font-bold text-lg pt-2">{label}</Tag>
  }

  if (type === 'paragraph') {
    return <p className="text-gray-600 pt-2">{config?.content || 'Paragraph text...'}</p>
  }

  if (type === 'divider') {
    return <hr className="border-gray-200 my-2" />
  }

  if (type === 'spacer') {
    return <div style={{ height: config?.height || 24 }} className="bg-gray-100 rounded opacity-50" />
  }

  if (type === 'page-break') {
    return (
      <div className="py-4 text-center border-2 border-dashed border-indigo-200 rounded-lg bg-indigo-50/50">
        <p className="text-indigo-600 font-medium">Page Break</p>
        <p className="text-xs text-indigo-400">New step starts here</p>
      </div>
    )
  }

  return (
    <div className="pt-4">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Preview */}
      {['text', 'email', 'phone', 'number', 'url', 'password'].includes(type) && (
        <input
          type="text"
          placeholder={placeholder}
          disabled
          className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
        />
      )}

      {type === 'textarea' && (
        <textarea
          placeholder={placeholder}
          rows={config?.rows || 4}
          disabled
          className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed resize-none"
        />
      )}

      {type === 'select' && (
        <select disabled className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed">
          <option>{placeholder || 'Select an option'}</option>
        </select>
      )}

      {type === 'radio' && options && (
        <div className="space-y-2">
          {options.map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-gray-600">
              <input type="radio" disabled className="text-indigo-600" />
              {opt.label}
            </label>
          ))}
        </div>
      )}

      {type === 'checkbox' && options && (
        <div className="space-y-2">
          {options.map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" disabled className="rounded text-indigo-600" />
              {opt.label}
            </label>
          ))}
        </div>
      )}

      {type === 'toggle' && (
        <div className="flex items-center gap-3">
          <div className="w-11 h-6 bg-gray-200 rounded-full relative">
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
          </div>
        </div>
      )}

      {['date', 'time', 'datetime'].includes(type) && (
        <input
          type="text"
          placeholder={type === 'date' ? 'MM/DD/YYYY' : type === 'time' ? 'HH:MM' : 'MM/DD/YYYY HH:MM'}
          disabled
          className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
        />
      )}

      {['file', 'image'].includes(type) && (
        <div className="border-2 border-dashed rounded-lg p-6 text-center text-gray-400">
          <p>Click or drag to upload</p>
        </div>
      )}

      {type === 'rating' && (
        <div className="flex gap-1">
          {[...Array(config?.maxRating || 5)].map((_, i) => (
            <div key={i} className="text-2xl text-gray-300">★</div>
          ))}
        </div>
      )}

      {type === 'slider' && (
        <div>
          <input
            type="range"
            min={config?.min || 0}
            max={config?.max || 100}
            disabled
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{config?.min || 0}</span>
            <span>{config?.max || 100}</span>
          </div>
        </div>
      )}

      {type === 'color' && (
        <div className="flex items-center gap-2">
          <div 
            className="w-10 h-10 rounded-lg border"
            style={{ backgroundColor: config?.defaultValue || '#6366f1' }}
          />
          <span className="text-gray-400 font-mono text-sm">
            {config?.defaultValue || '#6366f1'}
          </span>
        </div>
      )}

      {type === 'signature' && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center text-gray-400">
          <p>Sign here</p>
        </div>
      )}

      {/* Help Text */}
      {helpText && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}

// Form Preview (for preview mode)
function FormPreview({ 
  currentStep, 
  onStepChange 
}: { 
  currentStep: number
  onStepChange: (step: number) => void 
}) {
  const { state, getFieldsForStep } = useBuilder()
  const { schema } = state
  const [formData, setFormData] = useState<Record<string, unknown>>({})

  const currentFields = getFieldsForStep(currentStep)
  const isMultiStep = schema.isMultiStep && schema.steps.length > 1

  // Filter fields based on conditional logic
  const visibleFields = currentFields.filter(field => {
    if (!field.conditional?.enabled) return true
    return evaluateConditional(field.conditional, formData, schema.fields)
  })

  const handlePrev = () => {
    if (currentStep > 0) onStepChange(currentStep - 1)
  }

  const handleNext = () => {
    if (currentStep < schema.steps.length - 1) onStepChange(currentStep + 1)
  }

  const handleSubmit = () => {
    alert('Form submitted!\n\n' + JSON.stringify(formData, null, 2))
  }

  return (
    <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div 
          className="bg-white rounded-xl shadow-lg p-8"
          style={{ 
            backgroundColor: schema.theme.backgroundColor,
            color: schema.theme.textColor,
            fontFamily: schema.theme.fontFamily
          }}
        >
          {/* Progress bar for multi-step */}
          {isMultiStep && schema.settings.multiStep?.showProgressBar && (
            <ProgressBar
              currentStep={currentStep}
              totalSteps={schema.steps.length}
              steps={schema.steps}
              style={schema.theme.progressBarStyle}
              color={schema.theme.progressBarColor || schema.theme.primaryColor}
              onStepClick={schema.settings.multiStep?.allowBackNavigation ? onStepChange : undefined}
            />
          )}

          <h1 className="text-2xl font-bold mb-2">{schema.name}</h1>
          {schema.description && (
            <p className="text-gray-600 mb-6">{schema.description}</p>
          )}

          {/* Step title */}
          {isMultiStep && (
            <div className="mb-6 pb-4 border-b">
              <h2 className="text-lg font-semibold">{schema.steps[currentStep]?.title}</h2>
              {schema.steps[currentStep]?.description && (
                <p className="text-sm text-gray-500">{schema.steps[currentStep].description}</p>
              )}
            </div>
          )}

          <div className="space-y-4">
            {visibleFields.map(field => (
              <div key={field.id}>
                <FieldPreview field={field} />
              </div>
            ))}
          </div>

          {/* Navigation */}
          {isMultiStep ? (
            <StepButtons
              currentStep={currentStep}
              totalSteps={schema.steps.length}
              onPrev={handlePrev}
              onNext={handleNext}
              onSubmit={handleSubmit}
              prevText={schema.settings.multiStep?.prevButtonText}
              nextText={schema.settings.multiStep?.nextButtonText}
              submitText={schema.settings.multiStep?.completeButtonText}
              color={schema.theme.primaryColor}
              allowBack={schema.settings.multiStep?.allowBackNavigation}
            />
          ) : (
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-lg font-medium text-white mt-6"
              style={{ 
                backgroundColor: schema.theme.primaryColor,
                borderRadius: schema.theme.borderRadius === 'none' ? '0' :
                              schema.theme.borderRadius === 'small' ? '4px' :
                              schema.theme.borderRadius === 'large' ? '16px' : '8px'
              }}
            >
              {schema.settings.submitButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
