'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function NewFormPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [loadingWorkspace, setLoadingWorkspace] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    emailTo: '',
    redirectUrl: '',
    successMessage: 'Thank you for your submission!'
  })

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  // Fetch user's workspace on mount
  useEffect(() => {
    const fetchWorkspace = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      try {
        const res = await fetch(`${apiUrl}/v1/workspaces`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()

        if (data.success && data.data && data.data.length > 0) {
          setWorkspaceId(data.data[0].id)
        } else {
          // No workspace found - create one
          const createRes = await fetch(`${apiUrl}/v1/workspaces`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: 'My Workspace',
              slug: `workspace-${Date.now()}`
            })
          })
          const createData = await createRes.json()
          
          if (createData.success) {
            setWorkspaceId(createData.data.id)
          } else {
            toast.error('Failed to create workspace')
          }
        }
      } catch (err) {
        console.error('Failed to fetch workspace:', err)
        toast.error('Failed to load workspace')
      } finally {
        setLoadingWorkspace(false)
      }
    }

    fetchWorkspace()
  }, [apiUrl, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!workspaceId) {
      toast.error('No workspace found. Please refresh and try again.')
      return
    }

    setIsLoading(true)

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`${apiUrl}/v1/forms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workspaceId, // <-- THIS WAS MISSING!
          name: formData.name,
          description: formData.description || undefined,
          emailTo: formData.emailTo ? formData.emailTo.split(',').map(e => e.trim()) : [],
          redirectUrl: formData.redirectUrl || undefined,
          successMessage: formData.successMessage || 'Thank you for your submission!'
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to create form')
      }

      toast.success('Form created successfully!')
      router.push(`/dashboard/forms/${data.data.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create form')
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard/forms"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to forms
        </Link>
        <h1 className="text-2xl font-bold">Create New Form</h1>
        <p className="text-muted-foreground">
          Set up a new form endpoint to start collecting submissions
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Form Name <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="e.g., Contact Form, Newsletter Signup"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="Optional description for your reference"
            />
          </div>

          <div>
            <label htmlFor="emailTo" className="block text-sm font-medium mb-2">
              Notification Email(s)
            </label>
            <input
              id="emailTo"
              type="text"
              value={formData.emailTo}
              onChange={(e) => setFormData({ ...formData, emailTo: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="email@example.com, team@example.com"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Separate multiple emails with commas
            </p>
          </div>

          <div>
            <label htmlFor="redirectUrl" className="block text-sm font-medium mb-2">
              Redirect URL
            </label>
            <input
              id="redirectUrl"
              type="url"
              value={formData.redirectUrl}
              onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="https://yoursite.com/thank-you"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Where to redirect users after form submission
            </p>
          </div>

          <div>
            <label htmlFor="successMessage" className="block text-sm font-medium mb-2">
              Success Message
            </label>
            <input
              id="successMessage"
              type="text"
              value={formData.successMessage}
              onChange={(e) => setFormData({ ...formData, successMessage: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Thank you for your submission!"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Message shown in JSON response for AJAX submissions
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/dashboard/forms"
            className="px-6 py-3 border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading || !formData.name}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Form
          </button>
        </div>
      </form>
    </div>
  )
}