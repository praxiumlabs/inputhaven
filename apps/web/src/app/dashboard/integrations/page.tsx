'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  ExternalLink,
  Zap,
  MessageSquare,
  Database,
  Webhook,
  Users
} from 'lucide-react'
import { IntegrationCard } from '@/components/integrations/integration-card'
import { AddIntegrationModal } from '@/components/integrations/add-integration-modal'
import { useWorkspace } from '@/hooks/use-workspace'
import { toast } from 'sonner'

// Integration type definitions
const INTEGRATION_CATEGORIES = {
  communication: {
    name: 'Communication',
    icon: MessageSquare,
    color: 'text-blue-500'
  },
  automation: {
    name: 'Automation',
    icon: Zap,
    color: 'text-orange-500'
  },
  database: {
    name: 'Databases',
    icon: Database,
    color: 'text-green-500'
  },
  crm: {
    name: 'CRM',
    icon: Users,
    color: 'text-purple-500'
  },
  spreadsheet: {
    name: 'Spreadsheets',
    icon: Database,
    color: 'text-emerald-500'
  },
  webhook: {
    name: 'Webhooks',
    icon: Webhook,
    color: 'text-indigo-500'
  }
}

interface Integration {
  id: string
  type: string
  name: string
  isActive: boolean
  createdAt: string
  config: Record<string, unknown>
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
  configSchema: Record<string, unknown>
}

export default function IntegrationsPage() {
  const { workspaceId } = useWorkspace()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [availableIntegrations, setAvailableIntegrations] = useState<AvailableIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (workspaceId) {
      loadIntegrations()
      loadAvailableIntegrations()
    }
  }, [workspaceId])

  const loadIntegrations = async () => {
    try {
      const response = await fetch(`/api/integrations?workspaceId=${workspaceId}`)
      const data = await response.json()
      if (data.success) {
        setIntegrations(data.data)
      }
    } catch (error) {
      toast.error('Failed to load integrations')
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations/available')
      const data = await response.json()
      if (data.success) {
        setAvailableIntegrations(data.data)
      }
    } catch (error) {
      console.error('Failed to load available integrations')
    }
  }

  const handleToggle = async (integrationId: string) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/toggle`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data.success) {
        setIntegrations(prev =>
          prev.map(i => i.id === integrationId ? data.data : i)
        )
        toast.success(data.data.isActive ? 'Integration enabled' : 'Integration disabled')
      }
    } catch (error) {
      toast.error('Failed to toggle integration')
    }
  }

  const handleDelete = async (integrationId: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return

    try {
      const response = await fetch(`/api/integrations/${integrationId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        setIntegrations(prev => prev.filter(i => i.id !== integrationId))
        toast.success('Integration deleted')
      }
    } catch (error) {
      toast.error('Failed to delete integration')
    }
  }

  const handleTest = async (integrationId: string) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/test`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data.success && data.data.success) {
        toast.success('Integration test successful!')
      } else {
        toast.error(data.data?.message || 'Integration test failed')
      }
    } catch (error) {
      toast.error('Failed to test integration')
    }
  }

  const handleIntegrationAdded = (integration: Integration) => {
    setIntegrations(prev => [integration, ...prev])
    setShowAddModal(false)
    toast.success('Integration added successfully!')
  }

  // Filter integrations
  const filteredIntegrations = integrations.filter(i => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return i.name.toLowerCase().includes(query) || i.type.toLowerCase().includes(query)
    }
    return true
  })

  // Group by category
  const integrationsByCategory = filteredIntegrations.reduce((acc, integration) => {
    const available = availableIntegrations.find(a => a.type === integration.type)
    const category = available?.category || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(integration)
    return acc
  }, {} as Record<string, Integration[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations Hub</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect your forms to third-party services and automate your workflow
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Integration
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Total Integrations</div>
          <div className="text-2xl font-bold">{integrations.length}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {integrations.filter(i => i.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Disabled</div>
          <div className="text-2xl font-bold text-gray-400">
            {integrations.filter(i => !i.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Available</div>
          <div className="text-2xl font-bold text-indigo-600">
            {availableIntegrations.length}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          {Object.entries(INTEGRATION_CATEGORIES).map(([key, { name, icon: Icon, color }]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedCategory === key
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${color}`} />
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Integrations List */}
      {integrations.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed p-12 text-center">
          <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations yet</h3>
          <p className="text-gray-500 mb-4">
            Connect your forms to Slack, Discord, CRMs, and more
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Your First Integration
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(integrationsByCategory).map(([category, categoryIntegrations]) => {
            if (selectedCategory && selectedCategory !== category) return null
            
            const categoryInfo = INTEGRATION_CATEGORIES[category as keyof typeof INTEGRATION_CATEGORIES]
            
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  {categoryInfo && (
                    <>
                      <categoryInfo.icon className={`h-5 w-5 ${categoryInfo.color}`} />
                      <h2 className="text-lg font-semibold text-gray-900">{categoryInfo.name}</h2>
                    </>
                  )}
                  <span className="text-sm text-gray-500">({categoryIntegrations.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryIntegrations.map(integration => {
                    const definition = availableIntegrations.find(a => a.type === integration.type)
                    return (
                      <IntegrationCard
                        key={integration.id}
                        integration={integration}
                        definition={definition}
                        onToggle={() => handleToggle(integration.id)}
                        onDelete={() => handleDelete(integration.id)}
                        onTest={() => handleTest(integration.id)}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Integration Modal */}
      {showAddModal && (
        <AddIntegrationModal
          workspaceId={workspaceId}
          availableIntegrations={availableIntegrations}
          onClose={() => setShowAddModal(false)}
          onAdd={handleIntegrationAdded}
        />
      )}
    </div>
  )
}
