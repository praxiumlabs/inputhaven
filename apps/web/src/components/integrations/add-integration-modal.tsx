'use client'

import { useState, Fragment } from 'react'
import { X, Search, Check, ArrowLeft, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

// Integration icons mapping
const INTEGRATION_ICONS: Record<string, string> = {
  slack: '🔔',
  discord: '💬',
  google_sheets: '📊',
  notion: '📝',
  airtable: '🗂️',
  zapier: '⚡',
  n8n: '🔄',
  make: '🎯',
  hubspot: '🧡',
  salesforce: '☁️',
  webhook: '🔗'
}

interface AvailableIntegration {
  type: string
  name: string
  description: string
  icon: string
  color: string
  category: string
  features: string[]
  docsUrl: string
  configSchema: Record<string, ConfigField>
}

interface ConfigField {
  type: 'string' | 'password' | 'url' | 'select' | 'boolean' | 'json' | 'mapping'
  label: string
  description?: string
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  default?: unknown
}

interface Integration {
  id: string
  type: string
  name: string
  isActive: boolean
  createdAt: string
  config: Record<string, unknown>
}

interface AddIntegrationModalProps {
  workspaceId: string
  availableIntegrations: AvailableIntegration[]
  onClose: () => void
  onAdd: (integration: Integration) => void
}

type Step = 'select' | 'configure'

export function AddIntegrationModal({
  workspaceId,
  availableIntegrations,
  onClose,
  onAdd
}: AddIntegrationModalProps) {
  const [step, setStep] = useState<Step>('select')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIntegration, setSelectedIntegration] = useState<AvailableIntegration | null>(null)
  const [name, setName] = useState('')
  const [config, setConfig] = useState<Record<string, unknown>>({})
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const filteredIntegrations = availableIntegrations.filter(i => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      i.name.toLowerCase().includes(query) ||
      i.description.toLowerCase().includes(query) ||
      i.category.toLowerCase().includes(query)
    )
  })

  const groupedIntegrations = filteredIntegrations.reduce((acc, integration) => {
    if (!acc[integration.category]) acc[integration.category] = []
    acc[integration.category].push(integration)
    return acc
  }, {} as Record<string, AvailableIntegration[]>)

  const handleSelectIntegration = (integration: AvailableIntegration) => {
    setSelectedIntegration(integration)
    setName(`My ${integration.name}`)
    
    // Initialize config with defaults
    const defaultConfig: Record<string, unknown> = {}
    for (const [key, field] of Object.entries(integration.configSchema)) {
      if (field.default !== undefined) {
        defaultConfig[key] = field.default
      }
    }
    setConfig({ [integration.type]: defaultConfig })
    
    setStep('configure')
  }

  const handleConfigChange = (key: string, value: unknown) => {
    setConfig(prev => ({
      ...prev,
      [selectedIntegration!.type]: {
        ...(prev[selectedIntegration!.type] as Record<string, unknown> || {}),
        [key]: value
      }
    }))
    setTestResult(null)
  }

  const handleTest = async () => {
    if (!selectedIntegration) return
    
    setTesting(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          type: selectedIntegration.type,
          config
        })
      })
      
      const data = await response.json()
      setTestResult(data.data)
    } catch (error) {
      setTestResult({ success: false, message: 'Test failed' })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    if (!selectedIntegration) return
    
    setSaving(true)
    
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          type: selectedIntegration.type,
          name,
          config
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        onAdd(data.data)
      } else {
        toast.error(data.error?.message || 'Failed to add integration')
      }
    } catch (error) {
      toast.error('Failed to add integration')
    } finally {
      setSaving(false)
    }
  }

  const renderConfigField = (key: string, field: ConfigField) => {
    const typeConfig = config[selectedIntegration!.type] as Record<string, unknown> || {}
    const value = typeConfig[key] ?? field.default ?? ''

    switch (field.type) {
      case 'string':
      case 'url':
        return (
          <input
            type={field.type === 'url' ? 'url' : 'text'}
            value={value as string}
            onChange={e => handleConfigChange(key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        )

      case 'password':
        return (
          <input
            type="password"
            value={value as string}
            onChange={e => handleConfigChange(key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        )

      case 'select':
        return (
          <select
            value={value as string}
            onChange={e => handleConfigChange(key, e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )

      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={e => handleConfigChange(key, e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600">{field.description || 'Enable'}</span>
          </label>
        )

      case 'json':
        return (
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={e => {
              try {
                handleConfigChange(key, JSON.parse(e.target.value))
              } catch {
                handleConfigChange(key, e.target.value)
              }
            }}
            placeholder={field.placeholder || '{}'}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
          />
        )

      default:
        return (
          <input
            type="text"
            value={value as string}
            onChange={e => handleConfigChange(key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            {step === 'configure' && (
              <button
                onClick={() => setStep('select')}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold">
              {step === 'select' ? 'Add Integration' : `Configure ${selectedIntegration?.name}`}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === 'select' ? (
            <div className="p-6">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Integration List */}
              <div className="space-y-6">
                {Object.entries(groupedIntegrations).map(([category, integrations]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      {category}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {integrations.map(integration => (
                        <button
                          key={integration.type}
                          onClick={() => handleSelectIntegration(integration)}
                          className="flex items-start gap-3 p-4 border rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors text-left"
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                            style={{ backgroundColor: integration.color + '20' }}
                          >
                            {INTEGRATION_ICONS[integration.type] || '🔌'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900">{integration.name}</div>
                            <div className="text-sm text-gray-500 truncate">{integration.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedIntegration && (
            <div className="p-6">
              {/* Integration Header */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: selectedIntegration.color + '20' }}
                >
                  {INTEGRATION_ICONS[selectedIntegration.type] || '🔌'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedIntegration.name}</h3>
                  <p className="text-sm text-gray-500">{selectedIntegration.description}</p>
                </div>
                {selectedIntegration.docsUrl && (
                  <a
                    href={selectedIntegration.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    Documentation
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              {/* Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Integration Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="My Slack Integration"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Config Fields */}
              <div className="space-y-4">
                {Object.entries(selectedIntegration.configSchema).map(([key, field]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.description && field.type !== 'boolean' && (
                      <p className="text-xs text-gray-500 mb-1.5">{field.description}</p>
                    )}
                    {renderConfigField(key, field)}
                  </div>
                ))}
              </div>

              {/* Test Result */}
              {testResult && (
                <div className={`mt-6 p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                    <span className={testResult.success ? 'text-green-700' : 'text-red-700'}>
                      {testResult.message}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'configure' && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
            <button
              onClick={handleTest}
              disabled={testing}
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-white transition-colors disabled:opacity-50"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Test Connection
                </>
              )}
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !name}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Add Integration'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
