'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Inbox, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  ArrowRight,
  Plus,
  BarChart3
} from 'lucide-react'

interface DashboardStats {
  submissions: {
    total: number
    today: number
    thisMonth: number
    lastMonth: number
    growth: number
    spam: number
  }
  forms: {
    total: number
    active: number
  }
}

interface RecentSubmission {
  id: string
  form: { id: string; name: string }
  data: Record<string, any>
  createdAt: string
  isSpam: boolean
  isRead: boolean
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const headers = { Authorization: `Bearer ${token}` }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

    // Fetch dashboard stats
    Promise.all([
      fetch(`${apiUrl}/v1/analytics/dashboard`, { headers }).then(r => r.json()),
      fetch(`${apiUrl}/v1/submissions?limit=5`, { headers }).then(r => r.json())
    ])
      .then(([statsData, submissionsData]) => {
        if (statsData.success) setStats(statsData.data)
        if (submissionsData.success) setRecentSubmissions(submissionsData.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Submissions',
      value: stats?.submissions.total || 0,
      change: stats?.submissions.growth || 0,
      icon: Inbox,
      color: 'bg-blue-500'
    },
    {
      label: 'This Month',
      value: stats?.submissions.thisMonth || 0,
      subtext: `vs ${stats?.submissions.lastMonth || 0} last month`,
      icon: BarChart3,
      color: 'bg-green-500'
    },
    {
      label: 'Active Forms',
      value: stats?.forms.active || 0,
      subtext: `of ${stats?.forms.total || 0} total`,
      icon: FileText,
      color: 'bg-purple-500'
    },
    {
      label: 'Spam Blocked',
      value: stats?.submissions.spam || 0,
      subtext: 'protected by AI',
      icon: AlertCircle,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your form activity overview.
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                {stat.change !== undefined && (
                  <div className={`flex items-center gap-1 mt-1 text-sm ${
                    stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(stat.change)}% from last month
                  </div>
                )}
                {stat.subtext && (
                  <p className="text-sm text-muted-foreground mt-1">{stat.subtext}</p>
                )}
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-xl border">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Submissions</h2>
          <Link 
            href="/dashboard/submissions"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {recentSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-1">No submissions yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a form and start collecting submissions
            </p>
            <Link
              href="/dashboard/forms/new"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <Plus className="w-4 h-4" />
              Create your first form
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {recentSubmissions.map((submission) => (
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
                    {submission.form.name}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(submission.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          href="/dashboard/forms/new"
          className="p-6 bg-white rounded-xl border card-hover group"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-1">Create New Form</h3>
          <p className="text-sm text-muted-foreground">
            Set up a new form endpoint in seconds
          </p>
        </Link>
        
        <Link 
          href="/dashboard/analytics"
          className="p-6 bg-white rounded-xl border card-hover group"
        >
          <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
            <BarChart3 className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold mb-1">View Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Track submission trends and insights
          </p>
        </Link>
        
        <Link 
          href="/dashboard/settings"
          className="p-6 bg-white rounded-xl border card-hover group"
        >
          <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold mb-1">Integration Code</h3>
          <p className="text-sm text-muted-foreground">
            Get code snippets for your forms
          </p>
        </Link>
      </div>
    </div>
  )
}
