'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Sparkles, Bot, Globe } from 'lucide-react'
import Cookies from 'js-cookie'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const templateTypes = [
  { value: 'FORM_SCHEMA', label: 'Form Schema', description: 'Define form structure and validation' },
  { value: 'EMAIL_NOTIFICATION', label: 'Email Notification', description: 'Email sent when form is submitted' },
  { value: 'AUTO_RESPONSE', label: 'Auto Response', description: 'Automatic reply to form submitter' },
  { value: 'WEBHOOK_PAYLOAD', label: 'Webhook Payload', description: 'Structure of webhook data' },
  { value: 'AI_PROCESSOR', label: 'AI Processor', description: 'Custom AI processing pipeline' },
  { value: 'AGENT_INSTRUCTION', label: 'Agent Instruction', description: 'Instructions for AI agents' }
]

const categories = [
  { value: 'contact', label: 'Contact' },
  { value: 'support', label: 'Support' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'lead-gen', label: 'Lead Generation' },
  { value: 'survey', label: 'Survey' },
  { value: 'email', label: 'Email' },
  { value: 'booking', label: 'Booking' }
]

export default function NewTemplatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'FORM_SCHEMA',
    category: '',
    description: '',
    aiEnabled: true,
    mcpEnabled: true,
    // For form schema
    schema: {
      fields: {
        name: { type: 'string', title: 'Name', required: true },
        email: { type: 'string', title: 'Email', required: true, format: 'email' },
        message: { type: 'string', title: 'Message', required: true }
      },
      required: ['name', 'email', 'message']
    },
    // For email templates
    subject: '',
    body: ''
  })

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = Cookies.get('token')
      
      const payload: any = {
        name: formData.name,
        slug: formData.slug,
        type: formData.type,
        category: formData.category || undefined,
        description: formData.description || undefined,
        aiEnabled: formData.aiEnabled,
        mcpEnabled: formData.mcpEnabled,
        schema: formData.schema
      }

      // Add email fields for email templates
      if (formData.type === 'EMAIL_NOTIFICATION' || formData.type === 'AUTO_RESPONSE') {
        payload.subject = formData.subject
        payload.body = formData.body
      }

      const res = await fetch(`${apiUrl}/v1/templates`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (data.success) {
        router.push(`/dashboard/templates/${data.data.id}`)
      } else {
        setError(data.error?.message || 'Failed to create template')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const isEmailTemplate = formData.type === 'EMAIL_NOTIFICATION' || formData.type === 'AUTO_RESPONSE'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/templates"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Template</h1>
          <p className="text-muted-foreground">
            Build a reusable template for forms, emails, or AI processing
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                Template Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Contact Form"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="e.g., contact-form"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL-friendly identifier (lowercase, no spaces)
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this template is for..."
              rows={2}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                Template Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {templateTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {templateTypes.find(t => t.value === formData.type)?.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Capabilities</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.aiEnabled}
                onChange={(e) => setFormData({ ...formData, aiEnabled: e.target.checked })}
                className="mt-1"
              />
              <div>
                <div className="flex items-center gap-2 font-medium">
                  <Bot className="w-4 h-4 text-purple-600" />
                  AI Processing
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable AI classification, sentiment analysis, and smart routing
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.mcpEnabled}
                onChange={(e) => setFormData({ ...formData, mcpEnabled: e.target.checked })}
                className="mt-1"
              />
              <div>
                <div className="flex items-center gap-2 font-medium">
                  <Globe className="w-4 h-4 text-blue-600" />
                  MCP Protocol
                </div>
                <p className="text-sm text-muted-foreground">
                  Allow AI agents to discover and use this template
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Schema Editor (for form templates) */}
        {formData.type === 'FORM_SCHEMA' && (
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Form Schema</h2>
            <p className="text-sm text-muted-foreground">
              Define the fields for your form template
            </p>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Schema (JSON)
              </label>
              <textarea
                value={JSON.stringify(formData.schema, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    setFormData({ ...formData, schema: parsed })
                  } catch {
                    // Invalid JSON, keep typing
                  }
                }}
                rows={12}
                className="w-full px-4 py-2 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1">
                UFP-compatible JSON Schema format
              </p>
            </div>
          </div>
        )}

        {/* Email Content (for email templates) */}
        {isEmailTemplate && (
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Email Content</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Subject Line
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., New submission: {{_form.name}}"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {'{{variable}}'} for dynamic content
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email Body
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder={`Hi {{name}},\n\nThank you for your submission.\n\nBest regards`}
                rows={8}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available variables: {'{{name}}'}, {'{{email}}'}, {'{{_form.name}}'}, {'{{_ai.summary}}'}, {'{{_ai.sentiment}}'}
              </p>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/dashboard/templates"
            className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.name || !formData.slug}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Create Template
          </button>
        </div>
      </form>
    </div>
  )
}
