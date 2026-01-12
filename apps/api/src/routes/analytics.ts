import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'

const app = new Hono()

// Get dashboard stats
app.get('/dashboard', async (c) => {
  const user = c.get('user')
  const workspaceId = c.req.query('workspaceId')

  const whereClause: any = {
    workspace: {
      members: {
        some: { userId: user.id }
      }
    }
  }

  if (workspaceId) {
    whereClause.workspaceId = workspaceId
  }

  // Get date ranges
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  // Get forms with submission counts
  const forms = await prisma.form.findMany({
    where: whereClause,
    select: { id: true }
  })

  const formIds = forms.map(f => f.id)

  const [
    totalSubmissions,
    todaySubmissions,
    thisMonthSubmissions,
    lastMonthSubmissions,
    spamSubmissions,
    totalForms,
    activeForms
  ] = await Promise.all([
    prisma.submission.count({
      where: { formId: { in: formIds } }
    }),
    prisma.submission.count({
      where: { 
        formId: { in: formIds },
        createdAt: { gte: today }
      }
    }),
    prisma.submission.count({
      where: { 
        formId: { in: formIds },
        createdAt: { gte: thisMonth }
      }
    }),
    prisma.submission.count({
      where: { 
        formId: { in: formIds },
        createdAt: { gte: lastMonth, lt: thisMonth }
      }
    }),
    prisma.submission.count({
      where: { 
        formId: { in: formIds },
        isSpam: true
      }
    }),
    prisma.form.count({ where: whereClause }),
    prisma.form.count({ 
      where: { 
        ...whereClause,
        isActive: true,
        isArchived: false
      }
    })
  ])

  // Calculate growth
  const growth = lastMonthSubmissions > 0 
    ? ((thisMonthSubmissions - lastMonthSubmissions) / lastMonthSubmissions * 100).toFixed(1)
    : thisMonthSubmissions > 0 ? '100' : '0'

  return c.json({
    success: true,
    data: {
      submissions: {
        total: totalSubmissions,
        today: todaySubmissions,
        thisMonth: thisMonthSubmissions,
        lastMonth: lastMonthSubmissions,
        growth: parseFloat(growth),
        spam: spamSubmissions
      },
      forms: {
        total: totalForms,
        active: activeForms
      }
    }
  })
})

// Get submission timeline
app.get('/timeline', async (c) => {
  const user = c.get('user')
  const workspaceId = c.req.query('workspaceId')
  const formId = c.req.query('formId')
  const days = parseInt(c.req.query('days') || '30')

  const whereClause: any = {
    form: {
      workspace: {
        members: {
          some: { userId: user.id }
        }
      }
    }
  }

  if (workspaceId) {
    whereClause.form.workspaceId = workspaceId
  }

  if (formId) {
    whereClause.formId = formId
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  whereClause.createdAt = { gte: startDate }

  // Group by date
  const submissions = await prisma.submission.findMany({
    where: whereClause,
    select: {
      createdAt: true,
      isSpam: true
    }
  })

  // Build timeline
  const timeline: Record<string, { total: number; spam: number }> = {}
  
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const key = date.toISOString().split('T')[0]
    timeline[key] = { total: 0, spam: 0 }
  }

  for (const sub of submissions) {
    const key = sub.createdAt.toISOString().split('T')[0]
    if (timeline[key]) {
      timeline[key].total++
      if (sub.isSpam) timeline[key].spam++
    }
  }

  // Convert to array
  const data = Object.entries(timeline)
    .map(([date, stats]) => ({ date, ...stats }))
    .reverse()

  return c.json({
    success: true,
    data
  })
})

// Get form stats
app.get('/forms/:id', async (c) => {
  const user = c.get('user')
  const formId = c.req.param('id')

  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      workspace: {
        members: {
          some: { userId: user.id }
        }
      }
    }
  })

  if (!form) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Form not found' }
    }, 404)
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisWeek = new Date()
  thisWeek.setDate(thisWeek.getDate() - 7)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    total,
    todayCount,
    weekCount,
    monthCount,
    spamCount,
    unreadCount,
    viewCount,
    conversionRate,
    sentimentStats
  ] = await Promise.all([
    prisma.submission.count({ where: { formId } }),
    prisma.submission.count({ where: { formId, createdAt: { gte: today } } }),
    prisma.submission.count({ where: { formId, createdAt: { gte: thisWeek } } }),
    prisma.submission.count({ where: { formId, createdAt: { gte: thisMonth } } }),
    prisma.submission.count({ where: { formId, isSpam: true } }),
    prisma.submission.count({ where: { formId, isRead: false } }),
    prisma.formView.count({ where: { formId } }),
    prisma.formView.count({ where: { formId, completedAt: { not: null } } }),
    prisma.submission.groupBy({
      by: ['sentiment'],
      where: { formId, sentiment: { not: null } },
      _count: true
    })
  ])

  return c.json({
    success: true,
    data: {
      submissions: {
        total,
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
        spam: spamCount,
        unread: unreadCount
      },
      views: viewCount,
      conversionRate: viewCount > 0 ? (total / viewCount * 100).toFixed(1) : 0,
      sentiment: sentimentStats.reduce((acc, s) => {
        acc[s.sentiment || 'unknown'] = s._count
        return acc
      }, {} as Record<string, number>)
    }
  })
})

// Get top forms
app.get('/top-forms', async (c) => {
  const user = c.get('user')
  const workspaceId = c.req.query('workspaceId')
  const limit = parseInt(c.req.query('limit') || '5')

  const whereClause: any = {
    workspace: {
      members: {
        some: { userId: user.id }
      }
    },
    isActive: true,
    isArchived: false
  }

  if (workspaceId) {
    whereClause.workspaceId = workspaceId
  }

  const forms = await prisma.form.findMany({
    where: whereClause,
    orderBy: { submissionCount: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      submissionCount: true,
      lastSubmissionAt: true
    }
  })

  return c.json({
    success: true,
    data: forms
  })
})

// Get geographic data
app.get('/geo', async (c) => {
  const user = c.get('user')
  const formId = c.req.query('formId')

  const whereClause: any = {
    form: {
      workspace: {
        members: {
          some: { userId: user.id }
        }
      }
    }
  }

  if (formId) {
    whereClause.formId = formId
  }

  const submissions = await prisma.submission.findMany({
    where: whereClause,
    select: {
      metadata: true
    },
    take: 1000
  })

  // Count by country
  const countries: Record<string, number> = {}
  
  for (const sub of submissions) {
    const metadata = sub.metadata as any
    const country = metadata?.country || 'Unknown'
    countries[country] = (countries[country] || 0) + 1
  }

  const data = Object.entries(countries)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)

  return c.json({
    success: true,
    data
  })
})

export { app as analyticsRoutes }
