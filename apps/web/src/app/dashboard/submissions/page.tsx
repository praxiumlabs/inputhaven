'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { 
  Search, 
  Filter,
  Inbox,
  Star,
  Archive,
  Trash2,
  MoreVertical,
  Check,
  X,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

interface Submission {
  id: string
  form: { id: string; name: string }
  data: Record<string, any>
  isSpam: boolean
  isRead: boolean
  isStarred: boolean
  isArchived: boolean
  status: string
  createdAt: string
}

interface Form {
  id: string
  name: string
}

export default function SubmissionsPage() {
  const searchParams = useSearchParams()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedForm, setSelectedForm] = useState(searchParams.get('formId') || '')
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'spam' | 'archived'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    fetchData()
  }, [selectedForm, filter])

  const fetchData = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    const params = new URLSearchParams()
    if (selectedForm) params.append('formId', selectedForm)
    if (filter === 'unread') params.append('isRead', 'false')
    if (filter === 'spam') params.append('isSpam', 'true')

    try {
      const [subsRes, formsRes] = await Promise.all([
        fetch(`${apiUrl}/v1/submissions?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/v1/forms`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      const [subsData, formsData] = await Promise.all([
        subsRes.json(),
        formsRes.json()
      ])

      if (subsData.success) {
        let filtered = subsData.data
        if (filter === 'starred') filtered = filtered.filter((s: Submission) => s.isStarred)
        if (filter === 'archived') filtered = filtered.filter((s: Submission) => s.isArchived)
        setSubmissions(filtered)
      }
      if (formsData.success) setForms(formsData.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelected(newSelected)
  }

  const selectAll = () => {
    if (selected.size === filteredSubmissions.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredSubmissions.map(s => s.id)))
    }
  }

  const bulkAction = async (action: string) => {
    const token = localStorage.getItem('token')
    if (!token || selected.size === 0) return

    try {
      const res = await fetch(`${apiUrl}/v1/submissions/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: Array.from(selected),
          action
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        setSelected(new Set())
        fetchData()
      }
    } catch (err) {
      toast.error('Action failed')
    }
  }

  const filteredSubmissions = submissions.filter(sub => {
    const searchLower = search.toLowerCase()
    const dataStr = JSON.stringify(sub.data).toLowerCase()
    return dataStr.includes(searchLower) || sub.form.name.toLowerCase().includes(searchLower)
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Submissions</h1>
        <p className="text-muted-foreground">
          View and manage form submissions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search submissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <select
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value)}
          className="px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">All Forms</option>
          {forms.map(form => (
            <option key={form.id} value={form.id}>{form.name}</option>
          ))}
        </select>

        <div className="flex border rounded-lg overflow-hidden">
          {(['all', 'unread', 'starred', 'spam', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-sm capitalize ${
                filter === f 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-4 bg-muted p-3 rounded-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex gap-2">
            <button
              onClick={() => bulkAction('mark_read')}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-50"
            >
              <Check className="w-4 h-4" /> Mark Read
            </button>
            <button
              onClick={() => bulkAction('archive')}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-50"
            >
              <Archive className="w-4 h-4" /> Archive
            </button>
            <button
              onClick={() => bulkAction('mark_spam')}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-50"
            >
              <AlertTriangle className="w-4 h-4" /> Spam
            </button>
            <button
              onClick={() => bulkAction('delete')}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-50 text-destructive"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-sm text-muted-foreground hover:text-foreground"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Submissions list */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Inbox className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-1">No submissions found</h3>
          <p className="text-sm text-muted-foreground">
            {search || filter !== 'all' || selectedForm
              ? 'Try adjusting your filters'
              : 'Submissions will appear here when users submit your forms'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border divide-y">
          {/* Header row */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 text-sm font-medium text-muted-foreground">
            <input
              type="checkbox"
              checked={selected.size === filteredSubmissions.length && filteredSubmissions.length > 0}
              onChange={selectAll}
              className="rounded border-gray-300"
            />
            <div className="flex-1">Submission</div>
            <div className="w-32">Form</div>
            <div className="w-32">Date</div>
            <div className="w-20">Status</div>
          </div>

          {filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              className={`flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors ${
                !submission.isRead ? 'bg-primary/5' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(submission.id)}
                onChange={() => toggleSelect(submission.id)}
                className="rounded border-gray-300"
              />
              
              <Link
                href={`/dashboard/submissions/${submission.id}`}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    submission.isSpam ? 'bg-orange-500' : 
                    submission.isRead ? 'bg-transparent' : 'bg-primary'
                  }`} />
                  <p className={`truncate ${!submission.isRead ? 'font-medium' : ''}`}>
                    {submission.data.email || submission.data.name || 'Anonymous'}
                  </p>
                  {submission.isStarred && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  {submission.data.message || submission.data.subject || 
                    Object.entries(submission.data)
                      .filter(([k]) => !['email', 'name', 'access_key'].includes(k))
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ')
                      .slice(0, 100) || '-'
                  }
                </p>
              </Link>

              <div className="w-32 text-sm text-muted-foreground truncate">
                {submission.form.name}
              </div>

              <div className="w-32 text-sm text-muted-foreground">
                {new Date(submission.createdAt).toLocaleDateString()}
              </div>

              <div className="w-20">
                {submission.isSpam ? (
                  <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-700">
                    Spam
                  </span>
                ) : submission.isArchived ? (
                  <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
                    Archived
                  </span>
                ) : (
                  <span className={`px-2 py-1 text-xs rounded ${
                    submission.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                    submission.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {submission.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
