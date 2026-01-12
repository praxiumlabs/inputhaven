import Link from 'next/link'
import { Tag, Zap, Bug, Sparkles, ArrowRight } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'See what\'s new in InputHaven. Features, improvements, and bug fixes.'
}

interface ChangelogEntry {
  version: string
  date: string
  title: string
  description: string
  changes: {
    type: 'feature' | 'improvement' | 'fix'
    text: string
  }[]
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.0.0',
    date: 'January 2025',
    title: 'Universal Form Protocol & Integrations Hub',
    description: 'Major release introducing UFP, MCP support, and 11 new integrations.',
    changes: [
      { type: 'feature', text: 'Universal Form Protocol (UFP) v1.0 - The standard for AI-native forms' },
      { type: 'feature', text: 'Model Context Protocol (MCP) support for AI agents' },
      { type: 'feature', text: '11 new integrations: Slack, Discord, Google Sheets, Notion, Airtable, Zapier, n8n, Make, HubSpot, Salesforce, Webhooks' },
      { type: 'feature', text: 'AI Processing Pipeline with classification, sentiment, and summarization' },
      { type: 'feature', text: 'Templates system for reusable form schemas' },
      { type: 'feature', text: 'New SDKs: JavaScript/TypeScript, React, Python, CLI' },
      { type: 'improvement', text: 'Completely redesigned dashboard UI' },
      { type: 'improvement', text: 'Real-time submission updates' },
      { type: 'fix', text: 'Fixed webhook retry logic' },
    ]
  },
  {
    version: '1.5.0',
    date: 'December 2024',
    title: 'Team Collaboration',
    description: 'Introducing workspaces, team members, and role-based access control.',
    changes: [
      { type: 'feature', text: 'Workspaces for organizing forms by project or team' },
      { type: 'feature', text: 'Team invitations with role-based permissions' },
      { type: 'feature', text: 'Submission assignment and internal notes' },
      { type: 'feature', text: 'Activity timeline for submissions' },
      { type: 'improvement', text: 'Improved mobile dashboard experience' },
      { type: 'fix', text: 'Fixed date filtering in submission list' },
    ]
  },
  {
    version: '1.4.0',
    date: 'November 2024',
    title: 'AI Spam Protection',
    description: 'Advanced spam detection powered by machine learning.',
    changes: [
      { type: 'feature', text: 'AI-powered spam detection trained on millions of submissions' },
      { type: 'feature', text: 'Configurable spam threshold per form' },
      { type: 'feature', text: 'Spam quarantine and review workflow' },
      { type: 'improvement', text: 'Reduced false positives by 60%' },
      { type: 'fix', text: 'Fixed honeypot field visibility in some browsers' },
    ]
  },
  {
    version: '1.3.0',
    date: 'October 2024',
    title: 'Analytics Dashboard',
    description: 'Track form performance with detailed analytics.',
    changes: [
      { type: 'feature', text: 'Submission trends and graphs' },
      { type: 'feature', text: 'Geographic breakdown of submissions' },
      { type: 'feature', text: 'Conversion rate tracking' },
      { type: 'feature', text: 'Export analytics data as CSV' },
      { type: 'improvement', text: 'Faster dashboard loading' },
    ]
  },
  {
    version: '1.2.0',
    date: 'September 2024',
    title: 'File Uploads',
    description: 'Accept file attachments in your forms.',
    changes: [
      { type: 'feature', text: 'Support for file uploads up to 10MB (Free) / 25MB (Pro)' },
      { type: 'feature', text: 'Automatic virus scanning' },
      { type: 'feature', text: 'Image preview in dashboard' },
      { type: 'improvement', text: 'Improved file type validation' },
      { type: 'fix', text: 'Fixed upload progress indicator' },
    ]
  },
  {
    version: '1.1.0',
    date: 'August 2024',
    title: 'Auto Responses',
    description: 'Send automatic confirmation emails to form submitters.',
    changes: [
      { type: 'feature', text: 'Customizable auto-response emails' },
      { type: 'feature', text: 'Variable substitution ({{name}}, {{email}}, etc.)' },
      { type: 'feature', text: 'Delayed sending option' },
      { type: 'improvement', text: 'Email template editor' },
    ]
  },
  {
    version: '1.0.0',
    date: 'July 2024',
    title: 'Initial Release',
    description: 'InputHaven launches! The modern form backend for developers.',
    changes: [
      { type: 'feature', text: 'Form submissions via HTML, AJAX, or API' },
      { type: 'feature', text: 'Email notifications' },
      { type: 'feature', text: 'Basic spam protection with honeypot fields' },
      { type: 'feature', text: 'Custom success redirects and messages' },
      { type: 'feature', text: 'Submission management dashboard' },
      { type: 'feature', text: 'REST API for developers' },
    ]
  },
]

function ChangeTypeIcon({ type }: { type: 'feature' | 'improvement' | 'fix' }) {
  switch (type) {
    case 'feature':
      return <Sparkles className="w-4 h-4 text-purple-500" />
    case 'improvement':
      return <Zap className="w-4 h-4 text-blue-500" />
    case 'fix':
      return <Bug className="w-4 h-4 text-orange-500" />
  }
}

function ChangeTypeBadge({ type }: { type: 'feature' | 'improvement' | 'fix' }) {
  const config = {
    feature: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'New' },
    improvement: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Improved' },
    fix: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Fixed' },
  }[type]

  return (
    <span className={`${config.bg} ${config.text} text-xs font-medium px-2 py-0.5 rounded-full`}>
      {config.label}
    </span>
  )
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IH</span>
            </div>
            <span className="font-bold text-xl">InputHaven</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/docs" className="text-gray-600 hover:text-gray-900">Docs</Link>
            <Link href="/changelog" className="text-indigo-600 font-medium">Changelog</Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">Log in</Link>
            <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 text-center bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Changelog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            New features, improvements, and fixes. See what we've been building.
          </p>
        </div>
      </section>

      {/* Changelog */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-16">
          {CHANGELOG.map((entry, i) => (
            <article key={entry.version} className="relative">
              {/* Timeline line */}
              {i < CHANGELOG.length - 1 && (
                <div className="absolute left-[19px] top-12 bottom-0 w-0.5 bg-gray-200" />
              )}
              
              {/* Version badge */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center z-10">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xl">v{entry.version}</span>
                    <span className="text-gray-500">{entry.date}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="ml-14">
                <h2 className="text-2xl font-bold mb-2">{entry.title}</h2>
                <p className="text-gray-600 mb-6">{entry.description}</p>

                {/* Changes */}
                <ul className="space-y-3">
                  {entry.changes.map((change, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <ChangeTypeIcon type={change.type} />
                      <span className="text-gray-700">{change.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        {/* Subscribe */}
        <section className="mt-20 bg-gray-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Stay Updated</h2>
          <p className="text-gray-600 mb-6">
            Get notified when we release new features.
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 font-medium">
              Subscribe
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">IH</span>
            </div>
            <span className="font-semibold">InputHaven</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-600">
            <Link href="/docs" className="hover:text-gray-900">Docs</Link>
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/status" className="hover:text-gray-900">Status</Link>
          </nav>
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} InputHaven</p>
        </div>
      </footer>
    </div>
  )
}
