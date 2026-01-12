import Link from 'next/link'
import { 
  Book, 
  Code, 
  Zap, 
  Webhook, 
  Bot, 
  Shield,
  ArrowRight,
  Search,
  ExternalLink,
  FileText,
  Terminal,
  Puzzle
} from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Learn how to integrate InputHaven into your website and applications.'
}

const QUICK_START = [
  {
    title: 'Create your first form',
    description: 'Get started in under 5 minutes',
    href: '/docs/quickstart',
    icon: Zap,
    time: '5 min'
  },
  {
    title: 'HTML form integration',
    description: 'Add forms to any website',
    href: '/docs/html-integration',
    icon: Code,
    time: '3 min'
  },
  {
    title: 'React components',
    description: 'Use our React SDK',
    href: '/docs/react',
    icon: Puzzle,
    time: '5 min'
  }
]

const SECTIONS = [
  {
    title: 'Getting Started',
    icon: Book,
    links: [
      { title: 'Introduction', href: '/docs/introduction' },
      { title: 'Quick Start', href: '/docs/quickstart' },
      { title: 'Concepts', href: '/docs/concepts' },
      { title: 'Authentication', href: '/docs/auth' },
    ]
  },
  {
    title: 'Integration Guides',
    icon: Code,
    links: [
      { title: 'HTML Forms', href: '/docs/html-integration' },
      { title: 'JavaScript / AJAX', href: '/docs/javascript' },
      { title: 'React', href: '/docs/react' },
      { title: 'Next.js', href: '/docs/nextjs' },
      { title: 'Python', href: '/docs/python' },
    ]
  },
  {
    title: 'API Reference',
    icon: Terminal,
    links: [
      { title: 'Overview', href: '/docs/api' },
      { title: 'Authentication', href: '/docs/api/auth' },
      { title: 'Forms', href: '/docs/api/forms' },
      { title: 'Submissions', href: '/docs/api/submissions' },
      { title: 'Webhooks', href: '/docs/api/webhooks' },
    ]
  },
  {
    title: 'Features',
    icon: Zap,
    links: [
      { title: 'Spam Protection', href: '/docs/spam-protection' },
      { title: 'File Uploads', href: '/docs/file-uploads' },
      { title: 'Auto Responses', href: '/docs/auto-responses' },
      { title: 'Notifications', href: '/docs/notifications' },
      { title: 'Analytics', href: '/docs/analytics' },
    ]
  },
  {
    title: 'Integrations',
    icon: Webhook,
    links: [
      { title: 'Overview', href: '/docs/integrations' },
      { title: 'Slack', href: '/docs/integrations/slack' },
      { title: 'Discord', href: '/docs/integrations/discord' },
      { title: 'Zapier', href: '/docs/integrations/zapier' },
      { title: 'Google Sheets', href: '/docs/integrations/google-sheets' },
      { title: 'Webhooks', href: '/docs/integrations/webhooks' },
    ]
  },
  {
    title: 'AI & UFP',
    icon: Bot,
    links: [
      { title: 'AI Processing', href: '/docs/ai' },
      { title: 'Universal Form Protocol', href: '/docs/ufp' },
      { title: 'MCP Integration', href: '/docs/mcp' },
      { title: 'Semantic Types', href: '/docs/semantic-types' },
    ]
  },
]

const SDKS = [
  { name: 'JavaScript / TypeScript', package: '@inputhaven/sdk', href: '/docs/sdk/javascript' },
  { name: 'React', package: '@inputhaven/react', href: '/docs/sdk/react' },
  { name: 'Python', package: 'inputhaven', href: '/docs/sdk/python' },
  { name: 'CLI', package: 'inputhaven-cli', href: '/docs/sdk/cli' },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IH</span>
              </div>
              <span className="font-bold text-xl">InputHaven</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600 font-medium">Documentation</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search docs..."
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>
            </div>
            <a 
              href="https://github.com/inputhaven" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              GitHub
            </a>
            <Link href="/dashboard" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            InputHaven Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Everything you need to integrate InputHaven into your projects.
          </p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search documentation..."
              className="w-full pl-12 pr-4 py-4 border rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            />
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Quick Start */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Quick Start</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {QUICK_START.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-start gap-4 p-6 border rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors group"
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200">
                  <item.icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 group-hover:text-indigo-600">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <span className="text-xs text-gray-400 mt-2 block">{item.time} read</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* Documentation Sections */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Documentation</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTIONS.map((section) => (
              <div key={section.title} className="border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <h3 className="font-semibold">{section.title}</h3>
                </div>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href}
                        className="text-gray-600 hover:text-indigo-600 text-sm flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* SDKs */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">SDKs & Libraries</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SDKS.map((sdk) => (
              <Link
                key={sdk.package}
                href={sdk.href}
                className="p-4 border rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
              >
                <h3 className="font-semibold mb-1">{sdk.name}</h3>
                <code className="text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {sdk.package}
                </code>
              </Link>
            ))}
          </div>
        </section>

        {/* API Reference CTA */}
        <section className="bg-gray-900 rounded-2xl p-8 text-center">
          <Terminal className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">API Reference</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Full REST API documentation with examples in multiple languages.
          </p>
          <Link
            href="/docs/api"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            View API Reference
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* Help */}
        <section className="mt-16 text-center">
          <h2 className="text-xl font-semibold mb-2">Need help?</h2>
          <p className="text-gray-600 mb-4">
            Can't find what you're looking for? We're here to help.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://github.com/inputhaven/inputhaven/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ExternalLink className="w-4 h-4" />
              GitHub Discussions
            </a>
            <span className="text-gray-300">|</span>
            <Link href="/contact" className="text-indigo-600 hover:text-indigo-700">
              Contact Support
            </Link>
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
