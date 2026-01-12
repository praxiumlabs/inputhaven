'use client'

import { useState } from 'react'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  ChevronRight,
  Edit2,
  Check,
  X,
  Layers
} from 'lucide-react'
import { useBuilder } from './builder-context'

export function StepNavigation() {
  const { 
    state, 
    setActiveStep, 
    addStep, 
    removeStep, 
    updateStep,
    reorderSteps,
    toggleMultiStep 
  } = useBuilder()
  
  const { schema, activeStepIndex } = state
  const [editingStep, setEditingStep] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [draggedStep, setDraggedStep] = useState<number | null>(null)

  const handleStartEdit = (index: number) => {
    setEditingStep(index)
    setEditValue(schema.steps[index].title)
  }

  const handleSaveEdit = () => {
    if (editingStep !== null && editValue.trim()) {
      updateStep(editingStep, { title: editValue.trim() })
    }
    setEditingStep(null)
    setEditValue('')
  }

  const handleCancelEdit = () => {
    setEditingStep(null)
    setEditValue('')
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedStep(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedStep === null || draggedStep === index) return
  }

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    if (draggedStep === null || draggedStep === toIndex) return
    reorderSteps(draggedStep, toIndex)
    setDraggedStep(null)
  }

  const handleDragEnd = () => {
    setDraggedStep(null)
  }

  if (!schema.isMultiStep) {
    return (
      <div className="p-4 border-b bg-gray-50">
        <button
          onClick={() => toggleMultiStep(true)}
          className="flex items-center gap-2 w-full p-3 border-2 border-dashed rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
        >
          <Layers className="w-4 h-4" />
          Enable multi-step form
        </button>
      </div>
    )
  }

  return (
    <div className="border-b bg-white">
      {/* Header */}
      <div className="px-4 py-2 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Layers className="w-4 h-4" />
          Steps ({schema.steps.length})
        </div>
        <button
          onClick={() => toggleMultiStep(false)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Disable
        </button>
      </div>

      {/* Steps */}
      <div className="p-2 space-y-1">
        {schema.steps.map((step, index) => (
          <div
            key={step.id}
            draggable
            onDragStart={e => handleDragStart(e, index)}
            onDragOver={e => handleDragOver(e, index)}
            onDrop={e => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
              activeStepIndex === index
                ? 'bg-indigo-100 text-indigo-700'
                : 'hover:bg-gray-100'
            } ${draggedStep === index ? 'opacity-50' : ''}`}
          >
            {/* Drag Handle */}
            <GripVertical className="w-4 h-4 text-gray-300 cursor-grab active:cursor-grabbing" />
            
            {/* Step Number */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              activeStepIndex === index
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {index + 1}
            </div>

            {/* Step Title */}
            {editingStep === index ? (
              <div className="flex-1 flex items-center gap-1">
                <input
                  type="text"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveEdit()
                    if (e.key === 'Escape') handleCancelEdit()
                  }}
                  className="flex-1 px-2 py-0.5 text-sm border rounded focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <button onClick={handleSaveEdit} className="p-1 hover:bg-green-100 rounded text-green-600">
                  <Check className="w-3 h-3" />
                </button>
                <button onClick={handleCancelEdit} className="p-1 hover:bg-red-100 rounded text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setActiveStep(index)}
                className="flex-1 text-sm font-medium truncate"
              >
                {step.title}
              </div>
            )}

            {/* Field Count */}
            <span className="text-xs text-gray-400">
              {step.fields.length} field{step.fields.length !== 1 ? 's' : ''}
            </span>

            {/* Actions */}
            {editingStep !== index && (
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => { e.stopPropagation(); handleStartEdit(index); }}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Rename"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                {schema.steps.length > 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); removeStep(index); }}
                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                    title="Delete step"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Add Step Button */}
        <button
          onClick={() => addStep()}
          className="flex items-center gap-2 w-full p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add step</span>
        </button>
      </div>
    </div>
  )
}

// Progress bar component for preview
interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  steps: { title: string }[]
  style?: 'bar' | 'steps' | 'dots'
  color?: string
  onStepClick?: (index: number) => void
}

export function ProgressBar({ 
  currentStep, 
  totalSteps, 
  steps,
  style = 'steps',
  color = '#6366f1',
  onStepClick
}: ProgressBarProps) {
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
          <button
            key={index}
            onClick={() => onStepClick?.(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentStep
                ? 'scale-125'
                : index < currentStep
                ? 'opacity-60'
                : 'opacity-30'
            }`}
            style={{ 
              backgroundColor: index <= currentStep ? color : '#d1d5db'
            }}
          />
        ))}
      </div>
    )
  }

  // Default: steps style
  return (
    <div className="mb-8">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={index} className="flex-1 flex items-center">
            {/* Step circle */}
            <button
              onClick={() => onStepClick?.(index)}
              className={`relative flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm transition-all ${
                index < currentStep
                  ? 'text-white'
                  : index === currentStep
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
              style={{
                backgroundColor: index <= currentStep ? color : undefined
              }}
            >
              {index < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </button>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2">
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    backgroundColor: index < currentStep ? color : '#e5e7eb'
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Step titles */}
      <div className="flex mt-2">
        {steps.map((step, index) => (
          <div key={index} className="flex-1 text-center">
            <span className={`text-xs ${
              index === currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
            }`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Step navigation buttons for preview
interface StepButtonsProps {
  currentStep: number
  totalSteps: number
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
  prevText?: string
  nextText?: string
  submitText?: string
  color?: string
  allowBack?: boolean
}

export function StepButtons({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
  prevText = 'Back',
  nextText = 'Next',
  submitText = 'Submit',
  color = '#6366f1',
  allowBack = true
}: StepButtonsProps) {
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t">
      {/* Back button */}
      {allowBack && !isFirstStep ? (
        <button
          onClick={onPrev}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          {prevText}
        </button>
      ) : (
        <div />
      )}

      {/* Next/Submit button */}
      <button
        onClick={isLastStep ? onSubmit : onNext}
        className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
        style={{ backgroundColor: color }}
      >
        {isLastStep ? submitText : nextText}
        {!isLastStep && <ChevronRight className="w-4 h-4 inline ml-1" />}
      </button>
    </div>
  )
}
