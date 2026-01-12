'use client'

import { useState } from 'react'
import { 
  X, 
  Plus, 
  Trash2, 
  GitBranch,
  Eye,
  EyeOff,
  Asterisk,
  SkipForward,
  Info
} from 'lucide-react'
import { 
  ConditionalLogic, 
  ConditionalRule, 
  ConditionalOperator,
  ConditionalAction,
  CONDITIONAL_OPERATORS,
  FormField,
  createConditionalRule,
  createDefaultConditional
} from './field-types'
import { useBuilder } from './builder-context'

interface ConditionalLogicEditorProps {
  field: FormField
  onClose: () => void
}

export function ConditionalLogicEditor({ field, onClose }: ConditionalLogicEditorProps) {
  const { state, updateFieldConditional, getFieldById } = useBuilder()
  const [conditional, setConditional] = useState<ConditionalLogic>(
    field.conditional || createDefaultConditional()
  )

  // Get all fields that can be used as conditions (exclude current field and layout elements)
  const availableFields = state.schema.fields.filter(
    f => f.id !== field.id && !['heading', 'paragraph', 'divider', 'spacer', 'page-break'].includes(f.type)
  )

  const handleSave = () => {
    updateFieldConditional(field.id, conditional)
    onClose()
  }

  const handleToggleEnabled = (enabled: boolean) => {
    setConditional(prev => ({ ...prev, enabled }))
  }

  const handleActionChange = (action: ConditionalAction) => {
    setConditional(prev => ({ ...prev, action }))
  }

  const handleLogicTypeChange = (logicType: 'all' | 'any') => {
    setConditional(prev => ({ ...prev, logicType }))
  }

  const handleAddRule = () => {
    if (availableFields.length === 0) return
    const newRule = createConditionalRule(availableFields[0].id)
    setConditional(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }))
  }

  const handleRemoveRule = (ruleId: string) => {
    setConditional(prev => ({
      ...prev,
      rules: prev.rules.filter(r => r.id !== ruleId)
    }))
  }

  const handleUpdateRule = (ruleId: string, updates: Partial<ConditionalRule>) => {
    setConditional(prev => ({
      ...prev,
      rules: prev.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r)
    }))
  }

  const getFieldOptions = (fieldId: string) => {
    const f = getFieldById(fieldId)
    return f?.options || []
  }

  const getOperatorsForField = (fieldId: string): ConditionalOperator[] => {
    const f = getFieldById(fieldId)
    if (!f) return Object.keys(CONDITIONAL_OPERATORS) as ConditionalOperator[]
    
    switch (f.type) {
      case 'number':
      case 'slider':
      case 'rating':
        return ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'is_empty', 'is_not_empty']
      case 'toggle':
      case 'checkbox':
        return ['is_checked', 'is_not_checked']
      case 'select':
      case 'radio':
      case 'multi-select':
        return ['equals', 'not_equals', 'is_empty', 'is_not_empty']
      default:
        return ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">Conditional Logic</h3>
              <p className="text-sm text-gray-500">Configure when "{field.label}" should appear</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Enable Toggle */}
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={conditional.enabled}
              onChange={e => handleToggleEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="font-medium">Enable conditional logic</div>
              <div className="text-sm text-gray-500">Show or hide this field based on other field values</div>
            </div>
          </label>

          {conditional.enabled && (
            <>
              {/* Action */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'show' as const, label: 'Show field', icon: Eye, description: 'Show when conditions match' },
                    { value: 'hide' as const, label: 'Hide field', icon: EyeOff, description: 'Hide when conditions match' },
                    { value: 'require' as const, label: 'Make required', icon: Asterisk, description: 'Require when conditions match' },
                    { value: 'skip_to' as const, label: 'Skip to step', icon: SkipForward, description: 'Jump to step when conditions match' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleActionChange(opt.value)}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors text-left ${
                        conditional.action === opt.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <opt.icon className={`w-5 h-5 ${conditional.action === opt.value ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <div>
                        <div className="font-medium text-sm">{opt.label}</div>
                        <div className="text-xs text-gray-500">{opt.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skip to step selector */}
              {conditional.action === 'skip_to' && state.schema.isMultiStep && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skip to step</label>
                  <select
                    value={conditional.targetStep || 0}
                    onChange={e => setConditional(prev => ({ ...prev, targetStep: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {state.schema.steps.map((step, i) => (
                      <option key={step.id} value={i}>
                        Step {i + 1}: {step.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Logic Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">When</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLogicTypeChange('all')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium text-sm transition-colors ${
                      conditional.logicType === 'all'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    ALL conditions match (AND)
                  </button>
                  <button
                    onClick={() => handleLogicTypeChange('any')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium text-sm transition-colors ${
                      conditional.logicType === 'any'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    ANY condition matches (OR)
                  </button>
                </div>
              </div>

              {/* Rules */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conditions</label>
                
                {availableFields.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                    <Info className="w-4 h-4 inline mr-2" />
                    Add more fields to your form to create conditions
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conditional.rules.map((rule, index) => {
                      const ruleField = getFieldById(rule.field)
                      const operators = getOperatorsForField(rule.field)
                      const options = getFieldOptions(rule.field)
                      const needsValue = CONDITIONAL_OPERATORS[rule.operator]?.valueRequired
                      
                      return (
                        <div key={rule.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          {index > 0 && (
                            <span className="text-xs text-gray-500 font-medium min-w-[40px]">
                              {conditional.logicType === 'all' ? 'AND' : 'OR'}
                            </span>
                          )}
                          
                          {/* Field selector */}
                          <select
                            value={rule.field}
                            onChange={e => handleUpdateRule(rule.id, { field: e.target.value })}
                            className="flex-1 px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-indigo-500"
                          >
                            {availableFields.map(f => (
                              <option key={f.id} value={f.id}>{f.label}</option>
                            ))}
                          </select>
                          
                          {/* Operator selector */}
                          <select
                            value={rule.operator}
                            onChange={e => handleUpdateRule(rule.id, { operator: e.target.value as ConditionalOperator })}
                            className="w-40 px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-indigo-500"
                          >
                            {operators.map(op => (
                              <option key={op} value={op}>{CONDITIONAL_OPERATORS[op].label}</option>
                            ))}
                          </select>
                          
                          {/* Value input */}
                          {needsValue && (
                            options.length > 0 ? (
                              <select
                                value={String(rule.value || '')}
                                onChange={e => handleUpdateRule(rule.id, { value: e.target.value })}
                                className="flex-1 px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="">Select value...</option>
                                {options.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={ruleField?.type === 'number' ? 'number' : 'text'}
                                value={String(rule.value || '')}
                                onChange={e => handleUpdateRule(rule.id, { value: e.target.value })}
                                placeholder="Value"
                                className="flex-1 px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-indigo-500"
                              />
                            )
                          )}
                          
                          {/* Delete button */}
                          <button
                            onClick={() => handleRemoveRule(rule.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                    
                    {/* Add Rule Button */}
                    <button
                      onClick={handleAddRule}
                      className="flex items-center gap-2 w-full p-3 border-2 border-dashed rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add condition
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Save Logic
          </button>
        </div>
      </div>
    </div>
  )
}

// Compact badge to show conditional status on fields
export function ConditionalBadge({ field }: { field: FormField }) {
  if (!field.conditional?.enabled || field.conditional.rules.length === 0) {
    return null
  }

  const actionIcons = {
    show: Eye,
    hide: EyeOff,
    require: Asterisk,
    skip_to: SkipForward
  }
  
  const Icon = actionIcons[field.conditional.action]

  return (
    <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
      <Icon className="w-3 h-3" />
      <span>
        {field.conditional.rules.length} rule{field.conditional.rules.length > 1 ? 's' : ''}
      </span>
    </div>
  )
}
