'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function NewFormPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    emailTo: '',
    redirectUrl: '',
    successMessage: 'Thank you for your submission!'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/forms`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            emailTo: formData.emailTo ? formData.emailTo.split(',').map(e => e.trim()) : []
          })
        }
      )

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

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isLoading || !formData.name}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isLoading ? 'Creating...' : 'Create Form'}
          </button>
          <Link
            href="/dashboard/forms"
            className="px-6 py-3 rounded-lg border hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
