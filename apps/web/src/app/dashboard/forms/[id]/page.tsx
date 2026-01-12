'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Copy, 
  Settings, 
  Inbox,
  ExternalLink,
  Check
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
  emailTo: string[]
  redirectUrl: string | null
  successMessage: string
  webhookUrl: string | null
  allowedDomains: string[]
  createdAt: string
}

interface Submission {
  id: string
  data: Record<string, any>
  isSpam: boolean
  isRead: boolean
  createdAt: string
}

export default function FormDetailPage() {
  const params = useParams()
  const formId = params.id as string
  const [form, setForm] = useState<Form | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'setup' | 'submissions'>('setup')

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    fetchData()
  }, [formId])

  const fetchData = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const [formRes, subsRes] = await Promise.all([
        fetch(`${apiUrl}/v1/forms/${formId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/v1/submissions?formId=${formId}&limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      const [formData, subsData] = await Promise.all([
        formRes.json(),
        subsRes.json()
      ])

      if (formData.success) setForm(formData.data)
      if (subsData.success) setSubmissions(subsData.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success(`${label} copied to clipboard`)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Form not found</h2>
        <Link href="/dashboard/forms" className="text-primary hover:underline">
          Back to forms
        </Link>
      </div>
    )
  }

  const htmlCode = `<form action="${apiUrl}/v1/submit" method="POST">
  <input type="hidden" name="access_key" value="${form.accessKey}">
  
  <label for="name">Name</label>
  <input type="text" name="name" id="name" required>
  
  <label for="email">Email</label>
  <input type="email" name="email" id="email" required>
  
  <label for="message">Message</label>
  <textarea name="message" id="message" required></textarea>
  
  <!-- Honeypot field for spam protection -->
  <input type="text" name="_gotcha" style="display:none">
  
  <button type="submit">Send Message</button>
</form>`

  const ajaxCode = `fetch('${apiUrl}/v1/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    access_key: '${form.accessKey}',
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello!'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link 
            href="/dashboard/forms"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to forms
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{form.name}</h1>
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
        </div>
        <Link
          href={`/dashboard/forms/${formId}/settings`}
          className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Total Submissions</p>
          <p className="text-2xl font-bold">{form.submissionCount}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Last Submission</p>
          <p className="text-2xl font-bold">
            {form.lastSubmissionAt 
              ? new Date(form.lastSubmissionAt).toLocaleDateString()
              : 'Never'
            }
          </p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Email Notifications</p>
          <p className="text-2xl font-bold">{form.emailTo.length || 0}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Created</p>
          <p className="text-2xl font-bold">
            {new Date(form.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'setup'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Setup & Integration
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'submissions'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Submissions ({form.submissionCount})
          </button>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'setup' ? (
        <div className="space-y-6">
          {/* Access Key */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-2">Form Endpoint</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use this endpoint URL and access key to submit forms
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-4 py-2 rounded text-sm font-mono">
                  {apiUrl}/v1/submit
                </code>
                <button
                  onClick={() => copyToClipboard(`${apiUrl}/v1/submit`, 'Endpoint')}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  {copied === 'Endpoint' ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-4 py-2 rounded text-sm font-mono">
                  {form.accessKey}
                </code>
                <button
                  onClick={() => copyToClipboard(form.accessKey, 'Access key')}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  {copied === 'Access key' ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* HTML Code */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">HTML Form</h3>
                <p className="text-sm text-muted-foreground">
                  Copy this code and paste it into your website
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(htmlCode, 'HTML code')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
              >
                {copied === 'HTML code' ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{htmlCode}</code>
            </pre>
          </div>

          {/* JavaScript/AJAX Code */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">JavaScript (AJAX)</h3>
                <p className="text-sm text-muted-foreground">
                  For JavaScript/React/Vue applications
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(ajaxCode, 'JavaScript code')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
              >
                {copied === 'JavaScript code' ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{ajaxCode}</code>
            </pre>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border">
          {submissions.length === 0 ? (
            <div className="p-12 text-center">
              <Inbox className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-1">No submissions yet</h3>
              <p className="text-sm text-muted-foreground">
                Submissions will appear here when users fill out your form
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y">
                {submissions.map((submission) => (
                  <Link
                    key={submission.id}
                    href={`/dashboard/submissions/${submission.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      submission.isSpam ? 'bg-orange-500' : 
                      submission.isRead ? 'bg-gray-300' : 'bg-primary'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {submission.data.email || submission.data.name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {submission.data.message || Object.values(submission.data).find(v => typeof v === 'string' && v.length > 10) || '-'}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
              {form.submissionCount > submissions.length && (
                <div className="p-4 border-t text-center">
                  <Link 
                    href={`/dashboard/submissions?formId=${formId}`}
                    className="text-primary hover:underline text-sm"
                  >
                    View all {form.submissionCount} submissions
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
