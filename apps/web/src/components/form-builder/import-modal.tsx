'use client'

import { useState, useRef } from 'react'
import { 
  X, 
  Upload, 
  FileJson, 
  AlertCircle,
  Check,
  Copy
} from 'lucide-react'
import { FormSchema } from './field-types'
import { useBuilder } from './builder-context'

interface ImportModalProps {
  onClose: () => void
}

export function ImportModal({ onClose }: ImportModalProps) {
  const { importSchema, state } = useBuilder()
  const [mode, setMode] = useState<'import' | 'export'>('import')
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setJsonInput(content)
      validateAndPreview(content)
    }
    reader.readAsText(file)
  }

  const validateAndPreview = (json: string) => {
    try {
      const parsed = JSON.parse(json)
      
      // Basic validation
      if (!parsed.fields && !parsed.name) {
        setError('Invalid schema: missing required fields')
        return false
      }
      
      setError('')
      return true
    } catch (err) {
      setError('Invalid JSON format')
      return false
    }
  }

  const handleImport = () => {
    if (!validateAndPreview(jsonInput)) return

    try {
      const parsed = JSON.parse(jsonInput)
      importSchema(parsed)
      onClose()
    } catch (err) {
      setError('Failed to import schema')
    }
  }

  const handleExport = () => {
    const json = JSON.stringify(state.schema, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${state.schema.name.toLowerCase().replace(/\s+/g, '-')}-schema.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    const json = JSON.stringify(state.schema, null, 2)
    await navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exportJson = JSON.stringify(state.schema, null, 2)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold">Import / Export Schema</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setMode('import')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              mode === 'import'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Import
          </button>
          <button
            onClick={() => setMode('export')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              mode === 'export'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Export
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'import' ? (
            <>
              {/* File Upload */}
              <div className="mb-4">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-6 border-2 border-dashed rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload JSON file</p>
                  <p className="text-xs text-gray-400 mt-1">or paste JSON below</p>
                </button>
              </div>

              {/* JSON Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JSON Schema
                </label>
                <textarea
                  value={jsonInput}
                  onChange={e => {
                    setJsonInput(e.target.value)
                    if (e.target.value) validateAndPreview(e.target.value)
                    else setError('')
                  }}
                  placeholder='{"name": "My Form", "fields": [...]}'
                  rows={12}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {/* Preview Info */}
              {jsonInput && !error && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <Check className="w-4 h-4" />
                    Valid schema detected
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Export Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Current Schema
                  </label>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-80 text-sm">
                  <code>{exportJson}</code>
                </pre>
              </div>

              {/* Schema Info */}
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{state.schema.fields.length}</div>
                  <div className="text-xs text-gray-500">Fields</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{state.schema.steps.length}</div>
                  <div className="text-xs text-gray-500">Steps</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {state.schema.fields.filter(f => f.conditional?.enabled).length}
                  </div>
                  <div className="text-xs text-gray-500">Conditionals</div>
                </div>
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
          {mode === 'import' ? (
            <button
              onClick={handleImport}
              disabled={!jsonInput || !!error}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import Schema
            </button>
          ) : (
            <button
              onClick={handleExport}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Download JSON
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Sample schemas for quick start
export const SAMPLE_SCHEMAS = {
  contact: {
    name: 'Contact Form',
    description: 'Simple contact form',
    isMultiStep: false,
    fields: [
      { id: 'f1', type: 'text', name: 'name', label: 'Full Name', required: true, stepIndex: 0 },
      { id: 'f2', type: 'email', name: 'email', label: 'Email Address', required: true, stepIndex: 0 },
      { id: 'f3', type: 'textarea', name: 'message', label: 'Message', required: true, stepIndex: 0 }
    ]
  },
  survey: {
    name: 'Customer Survey',
    description: 'Multi-step customer feedback survey',
    isMultiStep: true,
    steps: [
      { id: 's1', title: 'About You', fields: ['f1', 'f2'] },
      { id: 's2', title: 'Your Experience', fields: ['f3', 'f4', 'f5'] },
      { id: 's3', title: 'Feedback', fields: ['f6', 'f7'] }
    ],
    fields: [
      { id: 'f1', type: 'text', name: 'name', label: 'Your Name', required: true, stepIndex: 0 },
      { id: 'f2', type: 'email', name: 'email', label: 'Email', required: true, stepIndex: 0 },
      { id: 'f3', type: 'rating', name: 'satisfaction', label: 'Overall Satisfaction', required: true, stepIndex: 1 },
      { id: 'f4', type: 'radio', name: 'recommend', label: 'Would you recommend us?', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }], stepIndex: 1 },
      { id: 'f5', type: 'select', name: 'frequency', label: 'How often do you use our service?', options: [{ label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }, { label: 'Monthly', value: 'monthly' }], stepIndex: 1 },
      { id: 'f6', type: 'textarea', name: 'feedback', label: 'Additional Feedback', stepIndex: 2 },
      { id: 'f7', type: 'checkbox', name: 'contact', label: 'Contact Preferences', options: [{ label: 'Email updates', value: 'email' }, { label: 'Phone calls', value: 'phone' }], stepIndex: 2 }
    ]
  },
  registration: {
    name: 'Event Registration',
    description: 'Multi-step event registration form',
    isMultiStep: true,
    steps: [
      { id: 's1', title: 'Personal Info', fields: ['f1', 'f2', 'f3'] },
      { id: 's2', title: 'Event Details', fields: ['f4', 'f5'] },
      { id: 's3', title: 'Payment', fields: ['f6', 'f7'] }
    ],
    fields: [
      { id: 'f1', type: 'text', name: 'fullName', label: 'Full Name', required: true, stepIndex: 0 },
      { id: 'f2', type: 'email', name: 'email', label: 'Email', required: true, stepIndex: 0 },
      { id: 'f3', type: 'phone', name: 'phone', label: 'Phone Number', stepIndex: 0 },
      { id: 'f4', type: 'select', name: 'ticketType', label: 'Ticket Type', options: [{ label: 'General', value: 'general' }, { label: 'VIP', value: 'vip' }], required: true, stepIndex: 1 },
      { id: 'f5', type: 'number', name: 'quantity', label: 'Number of Tickets', required: true, stepIndex: 1 },
      { id: 'f6', type: 'text', name: 'cardName', label: 'Name on Card', required: true, stepIndex: 2 },
      { id: 'f7', type: 'toggle', name: 'terms', label: 'I agree to the terms and conditions', required: true, stepIndex: 2 }
    ]
  }
}
