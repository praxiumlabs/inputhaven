'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  MoreVertical,
  FileText,
  Inbox,
  ExternalLink,
  Copy,
  Trash2,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'

interface Form {
  id: string
  name: string
  description: string | null
  accessKey: string
  submissionCount: number
  lastSubmissionAt: string | null
  isActive: boolean
  isArchived: boolean
  createdAt: string
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/forms`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      if (data.success) {
        setForms(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyAccessKey = (accessKey: string) => {
    navigator.clipboard.writeText(accessKey)
    toast.success('Access key copied to clipboard')
  }

  const copyEndpoint = (accessKey: string) => {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/submit`
    navigator.clipboard.writeText(endpoint)
    toast.success('Endpoint URL copied to clipboard')
  }

  const toggleFormStatus = async (form: Form) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/forms/${form.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isActive: !form.isActive })
        }
      )
      const data = await res.json()
      if (data.success) {
        setForms(forms.map(f => f.id === form.id ? { ...f, isActive: !f.isActive } : f))
        toast.success(form.isActive ? 'Form deactivated' : 'Form activated')
      }
    } catch (err) {
      toast.error('Failed to update form')
    }
    setOpenMenu(null)
  }

  const deleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? This will also delete all submissions.')) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/forms/${formId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      const data = await res.json()
      if (data.success) {
        setForms(forms.filter(f => f.id !== formId))
        toast.success('Form deleted')
      }
    } catch (err) {
      toast.error('Failed to delete form')
    }
    setOpenMenu(null)
  }

  const filteredForms = forms.filter(form => 
    form.name.toLowerCase().includes(search.toLowerCase()) ||
    form.description?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Forms</h1>
          <p className="text-muted-foreground">
            Manage your form endpoints and settings
          </p>
        </div>
        <Link
          href="/dashboard/forms/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Form
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search forms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Forms list */}
      {filteredForms.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-1">
            {search ? 'No forms found' : 'No forms yet'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search 
              ? 'Try a different search term' 
              : 'Create your first form to start collecting submissions'
            }
          </p>
          {!search && (
            <Link
              href="/dashboard/forms/new"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Form
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredForms.map((form) => (
            <div
              key={form.id}
              className="bg-white rounded-xl border p-6 card-hover"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <Link 
                      href={`/dashboard/forms/${form.id}`}
                      className="font-semibold text-lg hover:text-primary transition-colors"
                    >
                      {form.name}
                    </Link>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      form.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {form.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {form.description && (
                    <p className="text-muted-foreground mt-1">{form.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Inbox className="w-4 h-4" />
                      {form.submissionCount} submissions
                    </span>
                    <span>
                      Created {new Date(form.createdAt).toLocaleDateString()}
                    </span>
                    {form.lastSubmissionAt && (
                      <span>
                        Last submission {new Date(form.lastSubmissionAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyAccessKey(form.accessKey)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Copy access key"
                  >
                    <Copy className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <Link
                    href={`/dashboard/forms/${form.id}`}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="View form"
                  >
                    <ExternalLink className="w-5 h-5 text-muted-foreground" />
                  </Link>
                  
                  {/* More menu */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === form.id ? null : form.id)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </button>
                    
                    {openMenu === form.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setOpenMenu(null)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                          <div className="p-1">
                            <Link
                              href={`/dashboard/forms/${form.id}/settings`}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              Settings
                            </Link>
                            <button
                              onClick={() => copyEndpoint(form.accessKey)}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors w-full"
                            >
                              <Copy className="w-4 h-4" />
                              Copy endpoint
                            </button>
                            <button
                              onClick={() => toggleFormStatus(form)}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors w-full"
                            >
                              {form.isActive ? (
                                <>
                                  <EyeOff className="w-4 h-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4" />
                                  Activate
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => deleteForm(form.id)}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors w-full text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
