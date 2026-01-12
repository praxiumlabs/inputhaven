'use client'

import { useState } from 'react'
import {
  MoreVertical,
  CheckCircle,
  XCircle,
  ExternalLink,
  Trash2,
  Play,
  Settings,
  Power,
  PowerOff
} from 'lucide-react'

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

interface Integration {
  id: string
  type: string
  name: string
  isActive: boolean
  createdAt: string
  config: Record<string, unknown>
}

interface IntegrationDefinition {
  type: string
  name: string
  description: string
  icon: string
  color: string
  category: string
  features: string[]
  docsUrl: string
}

interface IntegrationCardProps {
  integration: Integration
  definition?: IntegrationDefinition
  onToggle: () => void
  onDelete: () => void
  onTest: () => void
}

export function IntegrationCard({
  integration,
  definition,
  onToggle,
  onDelete,
  onTest
}: IntegrationCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [testing, setTesting] = useState(false)

  const handleTest = async () => {
    setTesting(true)
    await onTest()
    setTesting(false)
  }

  const icon = INTEGRATION_ICONS[integration.type] || '🔌'
  const bgColor = definition?.color || '#6366f1'

  return (
    <div className="relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: bgColor + '20' }}
            >
              {icon}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{integration.name}</h3>
              <p className="text-sm text-gray-500">{definition?.name || integration.type}</p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-20 py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      handleTest()
                    }}
                    disabled={testing}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Play className="h-4 w-4" />
                    {testing ? 'Testing...' : 'Test Integration'}
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      // TODO: Open edit modal
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4" />
                    Configure
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onToggle()
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {integration.isActive ? (
                      <>
                        <PowerOff className="h-4 w-4" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Power className="h-4 w-4" />
                        Enable
                      </>
                    )}
                  </button>
                  {definition?.docsUrl && (
                    <a
                      href={definition.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Documentation
                    </a>
                  )}
                  <div className="border-t my-1" />
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onDelete()
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">Status</span>
          <div className="flex items-center gap-1.5">
            {integration.isActive ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">Active</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Disabled</span>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        {definition?.features && definition.features.length > 0 && (
          <div className="space-y-1">
            {definition.features.slice(0, 3).map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                {feature}
              </div>
            ))}
          </div>
        )}

        {/* Created date */}
        <div className="mt-3 pt-3 border-t text-xs text-gray-400">
          Added {new Date(integration.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Quick toggle */}
      <button
        onClick={onToggle}
        className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center transition-colors ${
          integration.isActive ? 'bg-green-500' : 'bg-gray-300'
        }`}
        title={integration.isActive ? 'Click to disable' : 'Click to enable'}
      >
        <div className="w-2 h-2 rounded-full bg-white" />
      </button>
    </div>
  )
}
