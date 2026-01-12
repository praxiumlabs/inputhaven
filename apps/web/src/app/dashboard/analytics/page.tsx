'use client'

import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, Globe, Calendar } from 'lucide-react'

interface TimelineData {
  date: string
  total: number
  spam: number
}

interface GeoData {
  country: string
  count: number
}

export default function AnalyticsPage() {
  const [timeline, setTimeline] = useState<TimelineData[]>([])
  const [geoData, setGeoData] = useState<GeoData[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const [timelineRes, geoRes] = await Promise.all([
        fetch(`${apiUrl}/v1/analytics/timeline?days=${dateRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/v1/analytics/geo`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      const [timelineData, geoDataRes] = await Promise.all([
        timelineRes.json(),
        geoRes.json()
      ])

      if (timelineData.success) setTimeline(timelineData.data)
      if (geoDataRes.success) setGeoData(geoDataRes.data.slice(0, 10))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const maxValue = Math.max(...timeline.map(d => d.total), 1)
  const totalSubmissions = timeline.reduce((sum, d) => sum + d.total, 0)
  const totalSpam = timeline.reduce((sum, d) => sum + d.spam, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track your form submission trends and insights
          </p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Total Submissions</span>
          </div>
          <p className="text-3xl font-bold">{totalSubmissions}</p>
        </div>
        
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-sm text-muted-foreground">Spam Blocked</span>
          </div>
          <p className="text-3xl font-bold">{totalSpam}</p>
        </div>
        
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-muted-foreground">Daily Average</span>
          </div>
          <p className="text-3xl font-bold">
            {timeline.length > 0 ? (totalSubmissions / timeline.length).toFixed(1) : 0}
          </p>
        </div>
      </div>

      {/* Timeline chart */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-6">Submissions Over Time</h2>
        
        {timeline.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No data available for this period
          </div>
        ) : (
          <div className="h-64">
            <div className="flex items-end justify-between h-full gap-1">
              {timeline.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-primary/20 rounded-t relative group cursor-pointer"
                    style={{ height: `${(day.total / maxValue) * 100}%`, minHeight: day.total > 0 ? '4px' : '0' }}
                  >
                    {day.spam > 0 && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-orange-500/50 rounded-t"
                        style={{ height: `${(day.spam / day.total) * 100}%` }}
                      />
                    )}
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-primary rounded-t"
                      style={{ height: `${((day.total - day.spam) / Math.max(day.total, 1)) * 100}%` }}
                    />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {day.total} submissions
                        {day.spam > 0 && ` (${day.spam} spam)`}
                        <br />
                        {new Date(day.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {i % Math.ceil(timeline.length / 7) === 0 && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded" />
            <span className="text-muted-foreground">Valid submissions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500/50 rounded" />
            <span className="text-muted-foreground">Spam</span>
          </div>
        </div>
      </div>

      {/* Geographic data */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Top Countries</h2>
        </div>
        
        {geoData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No geographic data available
          </div>
        ) : (
          <div className="space-y-3">
            {geoData.map((country, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-8 text-sm text-muted-foreground">{i + 1}.</span>
                <span className="flex-1 font-medium">{country.country}</span>
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(country.count / geoData[0].count) * 100}%` }}
                  />
                </div>
                <span className="w-16 text-right text-sm text-muted-foreground">
                  {country.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
