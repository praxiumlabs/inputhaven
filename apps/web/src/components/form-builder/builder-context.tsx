'use client'

import React, { createContext, useContext, useReducer, useCallback } from 'react'
import {
  FormField,
  FormSchema,
  FormSettings,
  FormTheme,
  FormStep,
  FieldType,
  ConditionalLogic,
  createField,
  createStep,
  generateFieldName,
  generateStepId,
  DEFAULT_FORM_SETTINGS,
  DEFAULT_FORM_THEME
} from './field-types'

// Builder state
interface BuilderState {
  schema: FormSchema
  selectedFieldId: string | null
  activeStepIndex: number
  isDirty: boolean
  undoStack: FormSchema[]
  redoStack: FormSchema[]
  previewMode: boolean
  previewStepIndex: number
  draggedFieldType: FieldType | null
  showConditionalEditor: boolean
  showImportModal: boolean
}

// Actions
type BuilderAction =
  | { type: 'ADD_FIELD'; fieldType: FieldType; index?: number; stepIndex?: number }
  | { type: 'REMOVE_FIELD'; fieldId: string }
  | { type: 'UPDATE_FIELD'; fieldId: string; updates: Partial<FormField> }
  | { type: 'DUPLICATE_FIELD'; fieldId: string }
  | { type: 'MOVE_FIELD'; fieldId: string; toStepIndex: number; toIndex: number }
  | { type: 'REORDER_FIELD'; fromIndex: number; toIndex: number }
  | { type: 'SELECT_FIELD'; fieldId: string | null }
  | { type: 'UPDATE_FIELD_CONDITIONAL'; fieldId: string; conditional: ConditionalLogic }
  // Multi-step actions
  | { type: 'ADD_STEP'; afterIndex?: number }
  | { type: 'REMOVE_STEP'; stepIndex: number }
  | { type: 'UPDATE_STEP'; stepIndex: number; updates: Partial<FormStep> }
  | { type: 'REORDER_STEPS'; fromIndex: number; toIndex: number }
  | { type: 'SET_ACTIVE_STEP'; stepIndex: number }
  | { type: 'TOGGLE_MULTI_STEP'; enabled: boolean }
  // Form actions
  | { type: 'UPDATE_SETTINGS'; settings: Partial<FormSettings> }
  | { type: 'UPDATE_THEME'; theme: Partial<FormTheme> }
  | { type: 'UPDATE_FORM_INFO'; name?: string; description?: string }
  // UI actions
  | { type: 'SET_PREVIEW_MODE'; enabled: boolean }
  | { type: 'SET_PREVIEW_STEP'; stepIndex: number }
  | { type: 'SET_DRAGGED_FIELD'; fieldType: FieldType | null }
  | { type: 'TOGGLE_CONDITIONAL_EDITOR'; show: boolean }
  | { type: 'TOGGLE_IMPORT_MODAL'; show: boolean }
  // History
  | { type: 'UNDO' }
  | { type: 'REDO' }
  // Schema management
  | { type: 'LOAD_SCHEMA'; schema: FormSchema }
  | { type: 'IMPORT_SCHEMA'; schema: Partial<FormSchema> }
  | { type: 'RESET' }

// Initial state
const createInitialState = (initialSchema?: Partial<FormSchema>): BuilderState => {
  const defaultStep: FormStep = {
    id: generateStepId(),
    title: 'Step 1',
    description: '',
    fields: []
  }

  return {
    schema: {
      id: initialSchema?.id || `form_${Date.now()}`,
      name: initialSchema?.name || 'Untitled Form',
      description: initialSchema?.description || '',
      fields: initialSchema?.fields || [],
      isMultiStep: initialSchema?.isMultiStep || false,
      steps: initialSchema?.steps || [defaultStep],
      settings: { ...DEFAULT_FORM_SETTINGS, ...initialSchema?.settings },
      theme: { ...DEFAULT_FORM_THEME, ...initialSchema?.theme }
    },
    selectedFieldId: null,
    activeStepIndex: 0,
    isDirty: false,
    undoStack: [],
    redoStack: [],
    previewMode: false,
    previewStepIndex: 0,
    draggedFieldType: null,
    showConditionalEditor: false,
    showImportModal: false
  }
}

// Helper to save state for undo
function saveForUndo(state: BuilderState): BuilderState {
  return {
    ...state,
    undoStack: [...state.undoStack.slice(-19), state.schema],
    redoStack: [],
    isDirty: true
  }
}

// Get fields for a specific step
function getFieldsForStep(fields: FormField[], stepIndex: number): FormField[] {
  return fields.filter(f => (f.stepIndex || 0) === stepIndex)
}

// Reducer
function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'ADD_FIELD': {
      const stepIndex = action.stepIndex ?? state.activeStepIndex
      const newField = createField(action.fieldType, stepIndex)
      
      // Get fields in current step
      const stepFields = getFieldsForStep(state.schema.fields, stepIndex)
      const insertIndex = action.index ?? stepFields.length
      
      // Insert field at correct position
      const allFields = [...state.schema.fields]
      const stepStartIndex = allFields.findIndex(f => (f.stepIndex || 0) === stepIndex)
      const actualIndex = stepStartIndex === -1 ? allFields.length : stepStartIndex + insertIndex
      
      allFields.splice(actualIndex >= 0 ? actualIndex : allFields.length, 0, newField)
      
      // Update step's field list
      const steps = state.schema.steps.map((step, i) => {
        if (i === stepIndex) {
          const newFields = [...step.fields]
          newFields.splice(insertIndex, 0, newField.id)
          return { ...step, fields: newFields }
        }
        return step
      })
      
      return {
        ...saveForUndo(state),
        schema: { ...state.schema, fields: allFields, steps },
        selectedFieldId: newField.id
      }
    }

    case 'REMOVE_FIELD': {
      const field = state.schema.fields.find(f => f.id === action.fieldId)
      if (!field) return state
      
      const fields = state.schema.fields.filter(f => f.id !== action.fieldId)
      const steps = state.schema.steps.map(step => ({
        ...step,
        fields: step.fields.filter(id => id !== action.fieldId)
      }))
      
      return {
        ...saveForUndo(state),
        schema: { ...state.schema, fields, steps },
        selectedFieldId: state.selectedFieldId === action.fieldId ? null : state.selectedFieldId
      }
    }

    case 'UPDATE_FIELD': {
      const fields = state.schema.fields.map(f => {
        if (f.id === action.fieldId) {
          const updated = { ...f, ...action.updates }
          if (action.updates.label && f.name === generateFieldName(f.label)) {
            updated.name = generateFieldName(action.updates.label)
          }
          return updated
        }
        return f
      })
      
      return {
        ...saveForUndo(state),
        schema: { ...state.schema, fields }
      }
    }

    case 'UPDATE_FIELD_CONDITIONAL': {
      const fields = state.schema.fields.map(f => {
        if (f.id === action.fieldId) {
          return { ...f, conditional: action.conditional }
        }
        return f
      })
      
      return {
        ...saveForUndo(state),
        schema: { ...state.schema, fields }
      }
    }

    case 'DUPLICATE_FIELD': {
      const originalField = state.schema.fields.find(f => f.id === action.fieldId)
      if (!originalField) return state
      
      const newField: FormField = {
        ...originalField,
        id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${originalField.name}_copy`,
        label: `${originalField.label} (Copy)`
      }
      
      const fieldIndex = state.schema.fields.findIndex(f => f.id === action.fieldId)
      const fields = [...state.schema.fields]
      fields.splice(fieldIndex + 1, 0, newField)
      
      // Update step
      const stepIndex = originalField.stepIndex || 0
      const steps = state.schema.steps.map((step, i) => {
        if (i === stepIndex) {
          const idx = step.fields.indexOf(action.fieldId)
          const newFields = [...step.fields]
          newFields.splice(idx + 1, 0, newField.id)
          return { ...step, fields: newFields }
        }
        return step
      })
      
      return {
        ...saveForUndo(state),
        schema: { ...state.schema, fields, steps },
        selectedFieldId: newField.id
      }
    }

    case 'REORDER_FIELD': {
      const stepFields = getFieldsForStep(state.schema.fields, state.activeStepIndex)
      const [removed] = stepFields.splice(action.fromIndex, 1)
      stepFields.splice(action.toIndex, 0, removed)
      
      // Rebuild all fields maintaining order
      const otherFields = state.schema.fields.filter(f => (f.stepIndex || 0) !== state.activeStepIndex)
      const fields = [
        ...state.schema.fields.filter(f => (f.stepIndex || 0) < state.activeStepIndex),
        ...stepFields,
        ...state.schema.fields.filter(f => (f.stepIndex || 0) > state.activeStepIndex)
      ]
      
      // Update step field order
      const steps = state.schema.steps.map((step, i) => {
        if (i === state.activeStepIndex) {
          return { ...step, fields: stepFields.map(f => f.id) }
        }
        return step
      })
      
      return {
        ...saveForUndo(state),
        schema: { ...state.schema, fields, steps }
      }
    }

    case 'MOVE_FIELD': {
      const field = state.schema.fields.find(f => f.id === action.fieldId)
      if (!field) return state
      
      const oldStepIndex = field.stepIndex || 0
      
      // Update field's step index
      const fields = state.schema.fields.map(f => {
        if (f.id === action.fieldId) {
          return { ...f, stepIndex: action.toStepIndex }
        }
        return f
      })
      
      // Update steps
      const steps = state.schema.steps.map((step, i) => {
        if (i === oldStepIndex) {
          return { ...step, fields: step.fields.filter(id => id !== action.fieldId) }
        }
        if (i === action.toStepIndex) {
          const newFields = [...step.fields]
          newFields.splice(action.toIndex, 0, action.fieldId)
          return { ...step, fields: newFields }
        }
        return step
      })
      
      return {
        ...saveForUndo(state),
        schema: { ...state.schema, fields, steps }
      }
    }

    case 'SELECT_FIELD': {
      return {
        ...state,
        selectedFieldId: action.fieldId
      }
    }

    // Multi-step actions
    case 'ADD_STEP': {
      const insertIndex = (action.afterIndex ?? state.schema.steps.length - 1) + 1
      const newStep = createStep(`Step ${state.schema.steps.length + 1}`, insertIndex)
      
      const steps = [...state.schema.steps]
      steps.splice(insertIndex, 0, newStep)
      
      return {
        ...saveForUndo(state),
        schema: { ...state.schema, steps, isMultiStep: true },
        activeStepIndex: insertIndex
      }
    }

    case 'REMOVE_STEP': {
      if (state.schema.steps.length <= 1) return state
      
      const stepToRemove = state.schema.steps[action.stepIndex]
      
      // Move fields from removed step to previous step (or next if first)
      const targetStepIndex = action.stepIndex > 0 ? action.stepIndex - 1 : 1
      const fields = state.schema.fields.map(f => {
        if ((f.stepIndex || 0) === action.stepIndex) {
          return { ...f, stepIndex: targetStepIndex }
        }
        if ((f.stepIndex || 0) > action.stepIndex) {
          return { ...f, stepIndex: (f.stepIndex || 0) - 1 }
        }
        return f
      })
      
      // Update steps
      const steps = state.schema.steps.filter((_, i) => i !== action.stepIndex)
      const updatedSteps = steps.map((step, i) => {
        if (i === targetStepIndex && stepToRemove) {
          return { ...step, fields: [...step.fields, ...stepToRemove.fields] }
        }
        return step
      })
      
      return {
        ...saveForUndo(state),
        schema: { 
          ...state.schema, 
          fields, 
          steps: updatedSteps,
          isMultiStep: updatedSteps.length > 1
        },
        activeStepIndex: Math.min(state.activeStepIndex, updatedSteps.length - 1)
      }
    }

    case 'UPDATE_STEP': {
      const steps = state.schema.steps.map((step, i) => {
        if (i === action.stepIndex) {
          return { ...step, ...action.updates }
        }
        return step
      })
      
      return {
        ...saveForUndo(state),
        schema: { ...state.schema, steps }
      }
    }

    case 'REORDER_STEPS': {
      const steps = [...state.schema.steps]
      const [removed] = steps.splice(action.fromIndex, 1)
      steps.splice(action.toIndex, 0, removed)
      
      // Update field step indices
      const fields = state.schema.fields.map(f => {
        const oldIndex = f.stepIndex || 0
        if (oldIndex === action.fromIndex) {
          return { ...f, stepIndex: action.toIndex }
        }
        if (action.fromIndex < action.toIndex) {
          if (oldIndex > action.fromIndex && oldIndex <= action.toIndex) {
            return { ...f, stepIndex: oldIndex - 1 }
          }
        } else {
          if (oldIndex >= action.toIndex && oldIndex < action.fromIndex) {
            return { ...f, stepIndex: oldIndex + 1 }
          }
        }
        return f
      })
      
      return {
        ...saveForUndo(state),
        schema: { ...state.schema, steps, fields }
      }
    }

    case 'SET_ACTIVE_STEP': {
      return {
        ...state,
        activeStepIndex: action.stepIndex,
        selectedFieldId: null
      }
    }

    case 'TOGGLE_MULTI_STEP': {
      if (action.enabled && state.schema.steps.length === 1) {
        // Add a second step when enabling multi-step
        const newStep = createStep('Step 2', 1)
        return {
          ...saveForUndo(state),
          schema: { 
            ...state.schema, 
            isMultiStep: true,
            steps: [...state.schema.steps, newStep]
          }
        }
      }
      
      return {
        ...saveForUndo(state),
        schema: { ...state.schema, isMultiStep: action.enabled }
      }
    }

    case 'UPDATE_SETTINGS': {
      return {
        ...saveForUndo(state),
        schema: {
          ...state.schema,
          settings: { ...state.schema.settings, ...action.settings }
        }
      }
    }

    case 'UPDATE_THEME': {
      return {
        ...saveForUndo(state),
        schema: {
          ...state.schema,
          theme: { ...state.schema.theme, ...action.theme }
        }
      }
    }

    case 'UPDATE_FORM_INFO': {
      return {
        ...state,
        schema: {
          ...state.schema,
          ...(action.name !== undefined && { name: action.name }),
          ...(action.description !== undefined && { description: action.description })
        },
        isDirty: true
      }
    }

    case 'SET_PREVIEW_MODE': {
      return {
        ...state,
        previewMode: action.enabled,
        previewStepIndex: 0,
        selectedFieldId: action.enabled ? null : state.selectedFieldId
      }
    }

    case 'SET_PREVIEW_STEP': {
      return {
        ...state,
        previewStepIndex: action.stepIndex
      }
    }

    case 'SET_DRAGGED_FIELD': {
      return {
        ...state,
        draggedFieldType: action.fieldType
      }
    }

    case 'TOGGLE_CONDITIONAL_EDITOR': {
      return {
        ...state,
        showConditionalEditor: action.show
      }
    }

    case 'TOGGLE_IMPORT_MODAL': {
      return {
        ...state,
        showImportModal: action.show
      }
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state
      const previous = state.undoStack[state.undoStack.length - 1]
      return {
        ...state,
        schema: previous,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.schema],
        isDirty: true
      }
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state
      const next = state.redoStack[state.redoStack.length - 1]
      return {
        ...state,
        schema: next,
        undoStack: [...state.undoStack, state.schema],
        redoStack: state.redoStack.slice(0, -1),
        isDirty: true
      }
    }

    case 'LOAD_SCHEMA': {
      return {
        ...createInitialState(action.schema),
        undoStack: [],
        redoStack: []
      }
    }

    case 'IMPORT_SCHEMA': {
      // Merge imported schema with current
      const imported = action.schema
      return {
        ...saveForUndo(state),
        schema: {
          ...state.schema,
          name: imported.name || state.schema.name,
          description: imported.description || state.schema.description,
          fields: imported.fields || state.schema.fields,
          steps: imported.steps || state.schema.steps,
          isMultiStep: imported.isMultiStep ?? state.schema.isMultiStep,
          settings: { ...state.schema.settings, ...imported.settings },
          theme: { ...state.schema.theme, ...imported.theme }
        },
        showImportModal: false
      }
    }

    case 'RESET': {
      return createInitialState()
    }

    default:
      return state
  }
}

// Context
interface BuilderContextValue {
  state: BuilderState
  
  // Field actions
  addField: (fieldType: FieldType, index?: number, stepIndex?: number) => void
  removeField: (fieldId: string) => void
  updateField: (fieldId: string, updates: Partial<FormField>) => void
  updateFieldConditional: (fieldId: string, conditional: ConditionalLogic) => void
  duplicateField: (fieldId: string) => void
  reorderField: (fromIndex: number, toIndex: number) => void
  moveField: (fieldId: string, toStepIndex: number, toIndex: number) => void
  selectField: (fieldId: string | null) => void
  
  // Multi-step actions
  addStep: (afterIndex?: number) => void
  removeStep: (stepIndex: number) => void
  updateStep: (stepIndex: number, updates: Partial<FormStep>) => void
  reorderSteps: (fromIndex: number, toIndex: number) => void
  setActiveStep: (stepIndex: number) => void
  toggleMultiStep: (enabled: boolean) => void
  
  // Form actions
  updateSettings: (settings: Partial<FormSettings>) => void
  updateTheme: (theme: Partial<FormTheme>) => void
  updateFormInfo: (name?: string, description?: string) => void
  
  // UI actions
  setPreviewMode: (enabled: boolean) => void
  setPreviewStep: (stepIndex: number) => void
  setDraggedField: (fieldType: FieldType | null) => void
  toggleConditionalEditor: (show: boolean) => void
  toggleImportModal: (show: boolean) => void
  
  // History
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  
  // Schema
  loadSchema: (schema: FormSchema) => void
  importSchema: (schema: Partial<FormSchema>) => void
  resetBuilder: () => void
  
  // Helpers
  getSelectedField: () => FormField | null
  getFieldsForStep: (stepIndex: number) => FormField[]
  getFieldById: (fieldId: string) => FormField | undefined
}

const BuilderContext = createContext<BuilderContextValue | null>(null)

// Provider
interface BuilderProviderProps {
  children: React.ReactNode
  initialSchema?: Partial<FormSchema>
}

export function BuilderProvider({ children, initialSchema }: BuilderProviderProps) {
  const [state, dispatch] = useReducer(builderReducer, createInitialState(initialSchema))
  
  // Field actions
  const addField = useCallback((fieldType: FieldType, index?: number, stepIndex?: number) => {
    dispatch({ type: 'ADD_FIELD', fieldType, index, stepIndex })
  }, [])
  
  const removeField = useCallback((fieldId: string) => {
    dispatch({ type: 'REMOVE_FIELD', fieldId })
  }, [])
  
  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    dispatch({ type: 'UPDATE_FIELD', fieldId, updates })
  }, [])
  
  const updateFieldConditional = useCallback((fieldId: string, conditional: ConditionalLogic) => {
    dispatch({ type: 'UPDATE_FIELD_CONDITIONAL', fieldId, conditional })
  }, [])
  
  const duplicateField = useCallback((fieldId: string) => {
    dispatch({ type: 'DUPLICATE_FIELD', fieldId })
  }, [])
  
  const reorderField = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_FIELD', fromIndex, toIndex })
  }, [])
  
  const moveField = useCallback((fieldId: string, toStepIndex: number, toIndex: number) => {
    dispatch({ type: 'MOVE_FIELD', fieldId, toStepIndex, toIndex })
  }, [])
  
  const selectField = useCallback((fieldId: string | null) => {
    dispatch({ type: 'SELECT_FIELD', fieldId })
  }, [])
  
  // Multi-step actions
  const addStep = useCallback((afterIndex?: number) => {
    dispatch({ type: 'ADD_STEP', afterIndex })
  }, [])
  
  const removeStep = useCallback((stepIndex: number) => {
    dispatch({ type: 'REMOVE_STEP', stepIndex })
  }, [])
  
  const updateStep = useCallback((stepIndex: number, updates: Partial<FormStep>) => {
    dispatch({ type: 'UPDATE_STEP', stepIndex, updates })
  }, [])
  
  const reorderSteps = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_STEPS', fromIndex, toIndex })
  }, [])
  
  const setActiveStep = useCallback((stepIndex: number) => {
    dispatch({ type: 'SET_ACTIVE_STEP', stepIndex })
  }, [])
  
  const toggleMultiStep = useCallback((enabled: boolean) => {
    dispatch({ type: 'TOGGLE_MULTI_STEP', enabled })
  }, [])
  
  // Form actions
  const updateSettings = useCallback((settings: Partial<FormSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings })
  }, [])
  
  const updateTheme = useCallback((theme: Partial<FormTheme>) => {
    dispatch({ type: 'UPDATE_THEME', theme })
  }, [])
  
  const updateFormInfo = useCallback((name?: string, description?: string) => {
    dispatch({ type: 'UPDATE_FORM_INFO', name, description })
  }, [])
  
  // UI actions
  const setPreviewMode = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_PREVIEW_MODE', enabled })
  }, [])
  
  const setPreviewStep = useCallback((stepIndex: number) => {
    dispatch({ type: 'SET_PREVIEW_STEP', stepIndex })
  }, [])
  
  const setDraggedField = useCallback((fieldType: FieldType | null) => {
    dispatch({ type: 'SET_DRAGGED_FIELD', fieldType })
  }, [])
  
  const toggleConditionalEditor = useCallback((show: boolean) => {
    dispatch({ type: 'TOGGLE_CONDITIONAL_EDITOR', show })
  }, [])
  
  const toggleImportModal = useCallback((show: boolean) => {
    dispatch({ type: 'TOGGLE_IMPORT_MODAL', show })
  }, [])
  
  // History
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), [])
  const redo = useCallback(() => dispatch({ type: 'REDO' }), [])
  
  // Schema
  const loadSchema = useCallback((schema: FormSchema) => {
    dispatch({ type: 'LOAD_SCHEMA', schema })
  }, [])
  
  const importSchema = useCallback((schema: Partial<FormSchema>) => {
    dispatch({ type: 'IMPORT_SCHEMA', schema })
  }, [])
  
  const resetBuilder = useCallback(() => dispatch({ type: 'RESET' }), [])
  
  // Helpers
  const getSelectedField = useCallback(() => {
    if (!state.selectedFieldId) return null
    return state.schema.fields.find(f => f.id === state.selectedFieldId) || null
  }, [state.selectedFieldId, state.schema.fields])
  
  const getFieldsForStep = useCallback((stepIndex: number) => {
    return state.schema.fields.filter(f => (f.stepIndex || 0) === stepIndex)
  }, [state.schema.fields])
  
  const getFieldById = useCallback((fieldId: string) => {
    return state.schema.fields.find(f => f.id === fieldId)
  }, [state.schema.fields])
  
  const value: BuilderContextValue = {
    state,
    addField,
    removeField,
    updateField,
    updateFieldConditional,
    duplicateField,
    reorderField,
    moveField,
    selectField,
    addStep,
    removeStep,
    updateStep,
    reorderSteps,
    setActiveStep,
    toggleMultiStep,
    updateSettings,
    updateTheme,
    updateFormInfo,
    setPreviewMode,
    setPreviewStep,
    setDraggedField,
    toggleConditionalEditor,
    toggleImportModal,
    undo,
    redo,
    canUndo: state.undoStack.length > 0,
    canRedo: state.redoStack.length > 0,
    loadSchema,
    importSchema,
    resetBuilder,
    getSelectedField,
    getFieldsForStep,
    getFieldById
  }
  
  return (
    <BuilderContext.Provider value={value}>
      {children}
    </BuilderContext.Provider>
  )
}

// Hook
export function useBuilder() {
  const context = useContext(BuilderContext)
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider')
  }
  return context
}
