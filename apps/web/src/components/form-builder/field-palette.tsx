'use client'

import { useState } from 'react'
import { Search, ChevronDown, ChevronRight, GripVertical } from 'lucide-react'
import { FIELD_TYPES, FIELD_CATEGORIES, FieldType } from './field-types'
import { useBuilder } from './builder-context'
import { StepNavigation } from './step-navigation'

export function FieldPalette() {
  const { addField, setDraggedField, state } = useBuilder()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    Object.keys(FIELD_CATEGORIES)
  )

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleDragStart = (e: React.DragEvent, fieldType: FieldType) => {
    e.dataTransfer.setData('fieldType', fieldType)
    e.dataTransfer.effectAllowed = 'copy'
    setDraggedField(fieldType)
  }

  const handleDragEnd = () => {
    setDraggedField(null)
  }

  const handleAddField = (fieldType: FieldType) => {
    addField(fieldType, undefined, state.activeStepIndex)
  }

  // Filter fields based on search
  const filteredCategories = Object.entries(FIELD_CATEGORIES)
    .map(([key, category]) => {
      const filteredFields = category.fields.filter(fieldType => {
        const definition = FIELD_TYPES[fieldType]
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
          definition.label.toLowerCase().includes(query) ||
          definition.description.toLowerCase().includes(query)
        )
      })
      return { key, ...category, fields: filteredFields }
    })
    .filter(category => category.fields.length > 0)

  return (
    <div className="w-64 bg-white border-r flex flex-col h-full">
      {/* Step Navigation (if multi-step enabled) */}
      <StepNavigation />
      
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900 mb-3">Add Fields</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search fields..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Field Categories */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredCategories.map(category => (
          <div key={category.key} className="mb-2">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.key)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              {expandedCategories.includes(category.key) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              {category.label}
              <span className="ml-auto text-xs text-gray-400">
                {category.fields.length}
              </span>
            </button>

            {/* Fields */}
            {expandedCategories.includes(category.key) && (
              <div className="mt-1 space-y-1">
                {category.fields.map(fieldType => {
                  const definition = FIELD_TYPES[fieldType]
                  const Icon = definition.icon

                  return (
                    <div
                      key={fieldType}
                      draggable
                      onDragStart={e => handleDragStart(e, fieldType)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleAddField(fieldType)}
                      className={`flex items-center gap-2 px-2 py-2 rounded-lg border border-transparent hover:border-indigo-200 hover:bg-indigo-50 cursor-grab active:cursor-grabbing transition-colors group ${
                        fieldType === 'page-break' ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <GripVertical className="w-3 h-3 text-gray-300 group-hover:text-gray-400" />
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        fieldType === 'page-break' 
                          ? 'bg-indigo-100 group-hover:bg-indigo-200' 
                          : 'bg-gray-100 group-hover:bg-indigo-100'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          fieldType === 'page-break' 
                            ? 'text-indigo-600' 
                            : 'text-gray-500 group-hover:text-indigo-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${
                          fieldType === 'page-break' 
                            ? 'text-indigo-700' 
                            : 'text-gray-700 group-hover:text-indigo-700'
                        }`}>
                          {definition.label}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {definition.description}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No fields match "{searchQuery}"
          </div>
        )}
      </div>

      {/* Help */}
      <div className="p-4 border-t bg-gray-50">
        <p className="text-xs text-gray-500">
          Drag fields to the canvas or click to add.
        </p>
      </div>
    </div>
  )
}
