'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  FileText, 
  Mail, 
  MessageSquare, 
  Webhook,
  Bot,
  MoreVertical,
  Copy,
  Trash2,
  Eye,
  Star,
  Filter,
  Sparkles,
  Globe,
  Lock
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
  isSystem: boolean
  isPublic: boolean
  isPublished: boolean
  usageCount: number
  rating: number | null
  version: number
  aiEnabled: boolean
  mcpEnabled: boolean
  createdAt: string
  updatedAt: string
}

const typeIcons: Record<string, any> = {
  FORM_SCHEMA: FileText,
  EMAIL_NOTIFICATION: Mail,
  AUTO_RESPONSE: MessageSquare,
  WEBHOOK_PAYLOAD: Webhook,
  AI_PROCESSOR: Bot,
  OUTPUT_TRANSFORM: Sparkles,
  AGENT_INSTRUCTION: Bot
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

const categoryColors: Record<string, string> = {
  contact: 'bg-blue-100 text-blue-700',
  support: 'bg-orange-100 text-orange-700',
  feedback: 'bg-green-100 text-green-700',
  'lead-gen': 'bg-purple-100 text-purple-700',
  email: 'bg-pink-100 text-pink-700',
  survey: 'bg-yellow-100 text-yellow-700'
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [includeSystem, setIncludeSystem] = useState(true)
  const [includePublic, setIncludePublic] = useState(true)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [typeFilter, categoryFilter, includeSystem, includePublic])

  async function fetchTemplates() {
    try {
      const token = Cookies.get('token')
      const params = new URLSearchParams()
      if (typeFilter) params.append('type', typeFilter)
      if (categoryFilter) params.append('category', categoryFilter)
      if (includeSystem) params.append('includeSystem', 'true')
      if (includePublic) params.append('includePublic', 'true')

      const res = await fetch(`${apiUrl}/v1/templates?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()
      if (data.success) {
        setTemplates(data.data)
      } else {
        setError(data.error?.message || 'Failed to load templates')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  async function duplicateTemplate(id: string) {
    try {
      const token = Cookies.get('token')
      const res = await fetch(`${apiUrl}/v1/templates/${id}/duplicate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      const data = await res.json()
      if (data.success) {
        fetchTemplates()
        setOpenMenu(null)
      }
    } catch (err) {
      console.error('Failed to duplicate template:', err)
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const token = Cookies.get('token')
      const res = await fetch(`${apiUrl}/v1/templates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()
      if (data.success) {
        setTemplates(templates.filter(t => t.id !== id))
        setOpenMenu(null)
      }
    } catch (err) {
      console.error('Failed to delete template:', err)
    }
  }

  const filteredTemplates = templates.filter(t => {
    if (search) {
      const q = search.toLowerCase()
      return t.name.toLowerCase().includes(q) || 
             t.description?.toLowerCase().includes(q) ||
             t.slug.toLowerCase().includes(q)
    }
    return true
  })

  const myTemplates = filteredTemplates.filter(t => !t.isSystem)
  const systemTemplates = filteredTemplates.filter(t => t.isSystem)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Reusable form schemas, email templates, and AI processors
          </p>
        </div>
        <Link
          href="/dashboard/templates/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Template
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Categories</option>
          <option value="contact">Contact</option>
          <option value="support">Support</option>
          <option value="feedback">Feedback</option>
          <option value="lead-gen">Lead Gen</option>
          <option value="email">Email</option>
          <option value="survey">Survey</option>
        </select>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeSystem}
              onChange={(e) => setIncludeSystem(e.target.checked)}
              className="rounded"
            />
            System
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includePublic}
              onChange={(e) => setIncludePublic(e.target.checked)}
              className="rounded"
            />
            Public
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* My Templates */}
      {myTemplates.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">My Templates</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                onDuplicate={duplicateTemplate}
                onDelete={deleteTemplate}
              />
            ))}
          </div>
        </div>
      )}

      {/* System Templates */}
      {systemTemplates.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            System Templates
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {systemTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                onDuplicate={duplicateTemplate}
                onDelete={deleteTemplate}
              />
            ))}
          </div>
        </div>
      )}

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-xl">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            {search ? 'Try a different search term' : 'Create your first template to get started'}
          </p>
          <Link
            href="/dashboard/templates/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Template
          </Link>
        </div>
      )}
    </div>
  )
}

function TemplateCard({ 
  template, 
  openMenu, 
  setOpenMenu, 
  onDuplicate, 
  onDelete 
}: {
  template: Template
  openMenu: string | null
  setOpenMenu: (id: string | null) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}) {
  const Icon = typeIcons[template.type] || FileText

  return (
    <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow relative">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${template.isSystem ? 'bg-primary/10' : 'bg-muted'}`}>
          <Icon className={`w-5 h-5 ${template.isSystem ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        
        <div className="flex items-center gap-2">
          {template.isPublic && (
            <Globe className="w-4 h-4 text-green-600" title="Public" />
          )}
          {template.isSystem && (
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" title="System Template" />
          )}
          
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === template.id ? null : template.id)}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
            
            {openMenu === template.id && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenMenu(null)}
                />
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border z-50">
                  <div className="p-1">
                    <Link
                      href={`/dashboard/templates/${template.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    <button
                      onClick={() => onDuplicate(template.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md w-full"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    {!template.isSystem && (
                      <button
                        onClick={() => onDelete(template.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md w-full text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Link href={`/dashboard/templates/${template.id}`}>
        <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
          {template.name}
        </h3>
      </Link>
      
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {template.description || 'No description'}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs px-2 py-1 bg-muted rounded-full">
          {typeLabels[template.type] || template.type}
        </span>
        
        {template.category && (
          <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[template.category] || 'bg-gray-100 text-gray-700'}`}>
            {template.category}
          </span>
        )}

        {template.aiEnabled && (
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
            <Bot className="w-3 h-3" />
            AI
          </span>
        )}
      </div>

      <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
        <span>v{template.version}</span>
        <span>{template.usageCount} uses</span>
      </div>
    </div>
  )
}
