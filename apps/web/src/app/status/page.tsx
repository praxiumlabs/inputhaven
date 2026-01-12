'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  ExternalLink,
  Activity
} from 'lucide-react'

interface ServiceStatus {
  name: string
  status: 'operational' | 'degraded' | 'outage' | 'maintenance'
  latency?: number
  uptime?: number
}

interface Incident {
  id: string
  title: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  severity: 'minor' | 'major' | 'critical'
  createdAt: string
  updatedAt: string
  updates: {
    status: string
    message: string
    timestamp: string
  }[]
}

// Mock data - In production, fetch from your status API
const SERVICES: ServiceStatus[] = [
  { name: 'API', status: 'operational', latency: 45, uptime: 99.99 },
  { name: 'Form Submissions', status: 'operational', latency: 52, uptime: 99.98 },
  { name: 'AI Processing', status: 'operational', latency: 320, uptime: 99.95 },
  { name: 'Webhooks', status: 'operational', latency: 89, uptime: 99.97 },
  { name: 'Integrations', status: 'operational', latency: 156, uptime: 99.94 },
  { name: 'Dashboard', status: 'operational', latency: 78, uptime: 99.99 },
  { name: 'MCP Server', status: 'operational', latency: 62, uptime: 99.96 },
  { name: 'Email Delivery', status: 'operational', latency: 1200, uptime: 99.92 },
]

const PAST_INCIDENTS: Incident[] = [
  {
    id: '1',
    title: 'Elevated API latency',
    status: 'resolved',
    severity: 'minor',
    createdAt: '2025-01-10T14:30:00Z',
    updatedAt: '2025-01-10T15:45:00Z',
    updates: [
      { status: 'resolved', message: 'Issue has been resolved. API latency is back to normal.', timestamp: '2025-01-10T15:45:00Z' },
      { status: 'monitoring', message: 'Fix deployed. Monitoring for stability.', timestamp: '2025-01-10T15:30:00Z' },
      { status: 'identified', message: 'Root cause identified as database connection pool exhaustion.', timestamp: '2025-01-10T15:00:00Z' },
      { status: 'investigating', message: 'We are investigating reports of elevated API latency.', timestamp: '2025-01-10T14:30:00Z' },
    ]
  }
]

// Generate uptime data for the last 90 days
const generateUptimeData = () => {
  const data = []
  for (let i = 89; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    // Random status weighted towards operational
    const rand = Math.random()
    let status: 'operational' | 'degraded' | 'outage' = 'operational'
    if (rand > 0.98) status = 'outage'
    else if (rand > 0.95) status = 'degraded'
    
    data.push({
      date: date.toISOString().split('T')[0],
      status
    })
  }
  return data
}

const UPTIME_DATA = generateUptimeData()

function StatusBadge({ status }: { status: ServiceStatus['status'] }) {
  const config = {
    operational: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Operational' },
    degraded: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Degraded' },
    outage: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Outage' },
    maintenance: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Maintenance' },
  }[status]

  const Icon = config.icon

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
    </div>
  )
}

function OverallStatus({ services }: { services: ServiceStatus[] }) {
  const hasOutage = services.some(s => s.status === 'outage')
  const hasDegraded = services.some(s => s.status === 'degraded')
  const hasMaintenance = services.some(s => s.status === 'maintenance')

  if (hasOutage) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-red-700 mb-2">Service Outage</h2>
        <p className="text-red-600">Some services are currently experiencing issues.</p>
      </div>
    )
  }

  if (hasDegraded) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-yellow-700 mb-2">Degraded Performance</h2>
        <p className="text-yellow-600">Some services are experiencing degraded performance.</p>
      </div>
    )
  }

  if (hasMaintenance) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
        <Clock className="w-12 h-12 text-blue-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-blue-700 mb-2">Scheduled Maintenance</h2>
        <p className="text-blue-600">Some services are under scheduled maintenance.</p>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
      <h2 className="text-2xl font-bold text-green-700 mb-2">All Systems Operational</h2>
      <p className="text-green-600">All services are running smoothly.</p>
    </div>
  )
}

export default function StatusPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 1000)
  }

  // Calculate overall uptime
  const overallUptime = (
    SERVICES.reduce((acc, s) => acc + (s.uptime || 100), 0) / SERVICES.length
  ).toFixed(2)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IH</span>
            </div>
            <span className="font-bold text-xl">InputHaven</span>
            <span className="text-gray-400 mx-2">|</span>
            <span className="text-gray-600">Status</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <a 
              href="https://twitter.com/inputhaven" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              Updates
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Overall Status */}
        <OverallStatus services={SERVICES} />

        {/* Last Updated */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>

        {/* Uptime Graph */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">90-Day Uptime</h3>
            <span className="text-green-600 font-semibold">{overallUptime}%</span>
          </div>
          <div className="flex gap-0.5">
            {UPTIME_DATA.map((day, i) => (
              <div
                key={i}
                className={`flex-1 h-8 rounded-sm ${
                  day.status === 'operational' ? 'bg-green-400' :
                  day.status === 'degraded' ? 'bg-yellow-400' :
                  'bg-red-400'
                }`}
                title={`${day.date}: ${day.status}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>90 days ago</span>
            <span>Today</span>
          </div>
        </section>

        {/* Services */}
        <section className="mt-12">
          <h3 className="font-semibold text-gray-900 mb-4">Services</h3>
          <div className="bg-white rounded-xl border divide-y">
            {SERVICES.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  {service.latency && (
                    <span className="text-sm text-gray-500">{service.latency}ms</span>
                  )}
                  <StatusBadge status={service.status} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Past Incidents */}
        <section className="mt-12">
          <h3 className="font-semibold text-gray-900 mb-4">Past Incidents</h3>
          {PAST_INCIDENTS.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
              No incidents reported in the last 90 days.
            </div>
          ) : (
            <div className="space-y-4">
              {PAST_INCIDENTS.map((incident) => (
                <div key={incident.id} className="bg-white rounded-xl border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">{incident.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(incident.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      incident.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      incident.status === 'monitoring' ? 'bg-blue-100 text-blue-700' :
                      incident.status === 'identified' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {incident.status}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {incident.updates.slice(0, 2).map((update, i) => (
                      <div key={i} className="text-sm border-l-2 border-gray-200 pl-4">
                        <p className="font-medium text-gray-700 capitalize">{update.status}</p>
                        <p className="text-gray-600">{update.message}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(update.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Subscribe */}
        <section className="mt-12 bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-2">Get Status Updates</h3>
          <p className="text-gray-600 text-sm mb-4">
            Subscribe to receive notifications when incidents are created or resolved.
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              Subscribe
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} InputHaven. All rights reserved.</p>
          <p className="mt-2">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            {' · '}
            <Link href="/docs" className="hover:text-gray-900">Documentation</Link>
            {' · '}
            <a href="https://twitter.com/inputhaven" className="hover:text-gray-900">Twitter</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
