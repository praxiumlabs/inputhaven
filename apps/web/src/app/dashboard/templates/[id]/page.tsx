'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Copy, 
  Trash2, 
  Globe, 
  Lock,
  Bot,
  History,
  ExternalLink,
  Check,
  FileText,
  Mail,
  Sparkles
} from 'lucide-react'
import Cookies from 'js-cookie'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Template {
  id: string
  name: string
  slug: string
  type: string
  category: string | null
  description: string | null
  schema: any
  semantics: any
  aiInstructions: any
  aiEnabled: boolean
  mcpEnabled: boolean
  subject: string | null
  body: string | null
  bodyHtml: string | null
  isSystem: boolean
  isPublic: boolean
  isPublished: boolean
  version: number
  usageCount: number
  rating: number | null
  createdAt: string
  updatedAt: string
  workspace: {
    id: string
    name: string
  }
  versions: Array<{
    id: string
    version: number
    changelog: string | null
    createdAt: string
  }>
}

const typeLabels: Record<string, string> = {
  FORM_SCHEMA: 'Form Schema',
  EMAIL_NOTIFICATION: 'Email Notification',
  AUTO_RESPONSE: 'Auto Response',
  WEBHOOK_PAYLOAD: 'Webhook Payload',
  AI_PROCESSOR: 'AI Processor',
  OUTPUT_TRANSFORM: 'Output Transform',
  AGENT_INSTRUCTION: 'Agent Instruction'
}

export default function TemplateDetailPage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string

  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'schema' | 'versions'>('details')
  const [copied, setCopied] = useState('')

  const [editData, setEditData] = useState({
    name: '',
    description: '',
    category: '',
    aiEnabled: true,
    mcpEnabled: true,
    schema: {},
    subject: '',
    body: ''
  })

  useEffect(() => {
    fetchTemplate()
  }, [templateId])

  async function fetchTemplate() {
    try {
      const token = Cookies.get('token')
      const res = await fetch(`${apiUrl}/v1/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()
      if (data.success) {
        setTemplate(data.data)
        setEditData({
          name: data.data.name,
          description: data.data.description || '',
          category: data.data.category || '',
          aiEnabled: data.data.aiEnabled,
          mcpEnabled: data.data.mcpEnabled,
          schema: data.data.schema || {},
          subject: data.data.subject || '',
          body: data.data.body || ''
        })
      } else {
        setError(data.error?.message || 'Failed to load template')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (template?.isSystem) {
      setError('System templates cannot be modified')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = Cookies.get('token')
      const res = await fetch(`${apiUrl}/v1/templates/${templateId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editData.name,
          description: editData.description || null,
          category: editData.category || null,
          aiEnabled: editData.aiEnabled,
          mcpEnabled: editData.mcpEnabled,
          schema: editData.schema,
          subject: editData.subject || null,
          body: editData.body || null
        })
      })

      const data = await res.json()
      if (data.success) {
        setTemplate(data.data)
        setSuccess('Template saved successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error?.message || 'Failed to save template')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setSaving(false)
    }
  }

  async function handleDuplicate() {
    try {
      const token = Cookies.get('token')
      const res = await fetch(`${apiUrl}/v1/templates/${templateId}/duplicate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      const data = await res.json()
      if (data.success) {
        router.push(`/dashboard/templates/${data.data.id}`)
      }
    } catch (err) {
      setError('Failed to duplicate template')
    }
  }

  async function handleDelete() {
    if (template?.isSystem) {
      setError('System templates cannot be deleted')
      return
    }

    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const token = Cookies.get('token')
      const res = await fetch(`${apiUrl}/v1/templates/${templateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()
      if (data.success) {
        router.push('/dashboard/templates')
      } else {
        setError(data.error?.message || 'Failed to delete template')
      }
    } catch (err) {
      setError('Failed to connect to server')
    }
  }

  async function handlePublish() {
    try {
      const token = Cookies.get('token')
      const endpoint = template?.isPublished ? 'unpublish' : 'publish'
      const res = await fetch(`${apiUrl}/v1/templates/${templateId}/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()
      if (data.success) {
        setTemplate(data.data)
        setSuccess(template?.isPublished ? 'Template unpublished' : 'Template published to library')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError('Failed to update publish status')
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Template not found</h2>
        <Link href="/dashboard/templates" className="text-primary hover:underline">
          Back to templates
        </Link>
      </div>
    )
  }

  const isEmailTemplate = template.type === 'EMAIL_NOTIFICATION' || template.type === 'AUTO_RESPONSE'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/templates"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{template.name}</h1>
              {template.isSystem && (
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                  System
                </span>
              )}
              {template.isPublic && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Public
                </span>
              )}
            </div>
            <p className="text-muted-foreground">
              {typeLabels[template.type]} • v{template.version} • {template.usageCount} uses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-muted transition-colors"
          >
            <Copy className="w-4 h-4" />
            Duplicate
          </button>
          
          {!template.isSystem && (
            <>
              <button
                onClick={handlePublish}
                className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-muted transition-colors"
              >
                {template.isPublished ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    Publish
                  </>
                )}
              </button>
              
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          {['details', 'schema', 'versions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  disabled={template.isSystem}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  disabled={template.isSystem}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={editData.category}
                  onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  disabled={template.isSystem}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted"
                >
                  <option value="">None</option>
                  <option value="contact">Contact</option>
                  <option value="support">Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="lead-gen">Lead Gen</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editData.aiEnabled}
                    onChange={(e) => setEditData({ ...editData, aiEnabled: e.target.checked })}
                    disabled={template.isSystem}
                  />
                  <Bot className="w-4 h-4 text-purple-600" />
                  AI Processing
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editData.mcpEnabled}
                    onChange={(e) => setEditData({ ...editData, mcpEnabled: e.target.checked })}
                    disabled={template.isSystem}
                  />
                  <Globe className="w-4 h-4 text-blue-600" />
                  MCP Protocol
                </label>
              </div>
            </div>

            {/* Email Content */}
            {isEmailTemplate && (
              <div className="bg-white rounded-xl border p-6 space-y-4">
                <h2 className="text-lg font-semibold">Email Content</h2>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    value={editData.subject}
                    onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                    disabled={template.isSystem}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Body</label>
                  <textarea
                    value={editData.body}
                    onChange={(e) => setEditData({ ...editData, body: e.target.value })}
                    disabled={template.isSystem}
                    rows={8}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted font-mono text-sm"
                  />
                </div>
              </div>
            )}

            {/* Save Button */}
            {!template.isSystem && (
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h3 className="font-semibold">Template Info</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{typeLabels[template.type]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">v{template.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uses</span>
                  <span className="font-medium">{template.usageCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Workspace</span>
                  <span className="font-medium">{template.workspace.name}</span>
                </div>
              </div>
            </div>

            {/* UFP URI */}
            <div className="bg-white rounded-xl border p-6 space-y-3">
              <h3 className="font-semibold">UFP Reference</h3>
              
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Template ID</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted px-3 py-2 rounded overflow-x-auto">
                    {template.id}
                  </code>
                  <button
                    onClick={() => copyToClipboard(template.id, 'id')}
                    className="p-2 hover:bg-muted rounded transition-colors"
                  >
                    {copied === 'id' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Slug</label>
                <code className="block text-xs bg-muted px-3 py-2 rounded">
                  {template.slug}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schema Tab */}
      {activeTab === 'schema' && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Schema Definition</h2>
            <button
              onClick={() => copyToClipboard(JSON.stringify(editData.schema, null, 2), 'schema')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {copied === 'schema' ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              Copy JSON
            </button>
          </div>
          
          <textarea
            value={JSON.stringify(editData.schema, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                setEditData({ ...editData, schema: parsed })
              } catch {
                // Invalid JSON
              }
            }}
            disabled={template.isSystem}
            rows={20}
            className="w-full px-4 py-3 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted"
          />

          {!template.isSystem && (
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Save Schema
              </button>
            </div>
          )}
        </div>
      )}

      {/* Versions Tab */}
      {activeTab === 'versions' && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5" />
            Version History
          </h2>
          
          {template.versions.length === 0 ? (
            <p className="text-muted-foreground">No version history available</p>
          ) : (
            <div className="space-y-3">
              {template.versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0 ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Version {version.version}</span>
                      {index === 0 && (
                        <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {version.changelog || 'No changelog'}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(version.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
