import Link from 'next/link'
import { 
  ArrowRight, 
  Check, 
  Zap, 
  Shield, 
  Bell, 
  Code, 
  BarChart3, 
  Users,
  Globe,
  Bot,
  Sparkles,
  ChevronRight,
  Play,
  Star,
  Github,
  Twitter
} from 'lucide-react'

// Logos for social proof
const TRUSTED_BY = [
  { name: 'Vercel', logo: '▲' },
  { name: 'Stripe', logo: '◈' },
  { name: 'Linear', logo: '◯' },
  { name: 'Raycast', logo: '◉' },
  { name: 'Resend', logo: '✉' },
]

const TESTIMONIALS = [
  {
    quote: "InputHaven replaced our entire form backend. The AI spam detection alone saves us hours every week.",
    author: "Sarah Chen",
    role: "CTO at TechFlow",
    avatar: "SC"
  },
  {
    quote: "The MCP integration lets our AI agents handle form submissions autonomously. Game changer.",
    author: "Marcus Rivera",
    role: "Founder at AIStartup",
    avatar: "MR"
  },
  {
    quote: "We migrated from Formspree in 30 minutes. Better features, better pricing, better DX.",
    author: "Emily Watson",
    role: "Lead Developer at Scale",
    avatar: "EW"
  }
]

const STATS = [
  { value: '10M+', label: 'Submissions processed' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<50ms', label: 'Average response' },
  { value: '50K+', label: 'Active forms' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IH</span>
            </div>
            <span className="font-bold text-xl">InputHaven</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
              Docs
            </Link>
            <Link href="/changelog" className="text-gray-600 hover:text-gray-900 transition-colors">
              Changelog
            </Link>
            <Link href="/status" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Status
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/register" 
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm mb-6 border border-indigo-100">
              <Sparkles className="w-4 h-4" />
              <span>Now with Universal Form Protocol (UFP) v1.0</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Forms that work with
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> AI agents</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              The modern form backend for developers. AI-powered spam protection, 
              real-time webhooks, and the first form platform with native AI agent support via MCP.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link 
                href="/register" 
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200 text-lg font-medium"
              >
                Start for Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/docs" 
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-200 transition-colors text-lg font-medium"
              >
                <Play className="w-5 h-5" />
                View Demo
              </Link>
            </div>

            {/* Code Preview */}
            <div className="bg-gray-950 rounded-2xl p-6 text-left max-w-2xl mx-auto shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-2 text-gray-500 text-sm">index.html</span>
              </div>
              <pre className="text-sm overflow-x-auto">
                <code className="text-gray-300">
{`<form action="https://api.inputhaven.com/v1/submit/YOUR_FORM_ID" method="POST">
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <textarea name="message"></textarea>
  <button type="submit">Send</button>
</form>`}
                </code>
              </pre>
              <p className="text-gray-500 text-sm mt-4">That's it. No JavaScript required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 border-y bg-gray-50">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500 mb-8">TRUSTED BY DEVELOPERS AT</p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-60">
            {TRUSTED_BY.map((company) => (
              <div key={company.name} className="flex items-center gap-2 text-gray-600">
                <span className="text-2xl">{company.logo}</span>
                <span className="font-semibold">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need for forms
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From simple contact forms to complex multi-step workflows
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Shield,
                title: 'AI Spam Protection',
                description: 'Machine learning model trained on millions of submissions. Block spam before it reaches you.',
                badge: 'Smart'
              },
              {
                icon: Bell,
                title: 'Instant Notifications',
                description: 'Email, Slack, Discord, or custom webhooks. Get notified your way, in real-time.',
                badge: null
              },
              {
                icon: Bot,
                title: 'AI Agent Ready (MCP)',
                description: 'First form platform with Model Context Protocol support. Let AI agents fill forms.',
                badge: 'New'
              },
              {
                icon: Code,
                title: 'Developer First',
                description: 'Full REST API, TypeScript SDK, React components, Python SDK, and CLI tools.',
                badge: null
              },
              {
                icon: Globe,
                title: '11+ Integrations',
                description: 'Zapier, Make, n8n, Notion, Airtable, Google Sheets, HubSpot, Salesforce, and more.',
                badge: null
              },
              {
                icon: BarChart3,
                title: 'Analytics & Insights',
                description: 'Track conversion rates, geographic data, submission trends, and form performance.',
                badge: null
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Workspaces, role-based access, submission assignment, and internal notes.',
                badge: null
              },
              {
                icon: Zap,
                title: 'Auto Responses',
                description: 'Send customized confirmation emails automatically. Variables, templates, delays.',
                badge: null
              },
              {
                icon: Sparkles,
                title: 'AI Processing',
                description: 'Auto-classify, extract entities, analyze sentiment, and summarize submissions.',
                badge: 'Pro'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border hover:shadow-lg transition-all hover:border-indigo-200 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <feature.icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  {feature.badge && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      feature.badge === 'New' ? 'bg-green-100 text-green-700' :
                      feature.badge === 'Smart' ? 'bg-purple-100 text-purple-700' :
                      'bg-indigo-100 text-indigo-700'
                    }`}>
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UFP Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm mb-4">
                <Bot className="w-4 h-4" />
                Universal Form Protocol
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The first form backend built for AI
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                UFP is an open standard that makes forms understandable to AI agents. 
                Combined with MCP support, AI can discover, understand, and submit forms autonomously.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Semantic field types for AI understanding',
                  'MCP server for Claude and other AI agents',
                  'Auto-generated form schemas',
                  'AI agent session management'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link 
                href="/docs/ufp" 
                className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700"
              >
                Learn about UFP
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-gray-950 rounded-2xl p-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-2 text-gray-500 text-sm">UFP Schema</span>
              </div>
              <pre className="text-sm overflow-x-auto">
                <code className="text-gray-300">
{`{
  "ufp_version": "1.0",
  "fields": [
    {
      "name": "email",
      "semantic_type": "person.email",
      "ai_description": "User's email address"
    },
    {
      "name": "message", 
      "semantic_type": "content.message",
      "ai_description": "Main inquiry text"
    }
  ],
  "ai_instructions": {
    "classify": true,
    "sentiment": true,
    "auto_respond": false
  }
}`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by developers
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((testimonial, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, scale as you grow
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                description: 'Perfect for side projects',
                features: [
                  '250 submissions/month',
                  '1 form',
                  'Email notifications',
                  'Basic spam protection',
                  'Community support'
                ],
                cta: 'Get Started',
                popular: false
              },
              {
                name: 'Pro',
                price: '$19',
                period: '/month',
                description: 'For growing businesses',
                features: [
                  '25,000 submissions/month',
                  'Unlimited forms',
                  'AI spam protection',
                  'All integrations',
                  'Team collaboration',
                  'Priority support',
                  'Custom webhooks'
                ],
                cta: 'Start Free Trial',
                popular: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                description: 'For large organizations',
                features: [
                  'Unlimited submissions',
                  'Unlimited forms',
                  'Custom domain',
                  'SLA guarantee',
                  'Dedicated support',
                  'Custom integrations',
                  'On-premise option'
                ],
                cta: 'Contact Sales',
                popular: false
              }
            ].map((plan) => (
              <div 
                key={plan.name} 
                className={`p-8 rounded-2xl border-2 ${
                  plan.popular 
                    ? 'border-indigo-600 bg-indigo-50/50 relative' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.name === 'Enterprise' ? '/contact' : '/register'}
                  className={`block w-full py-3 rounded-xl text-center font-medium transition-colors ${
                    plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/pricing" className="text-indigo-600 hover:text-indigo-700 font-medium">
              View detailed pricing comparison →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to modernize your forms?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who trust InputHaven for their form backend.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors text-lg font-medium"
            >
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 text-white border-2 border-white/30 px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-lg font-medium"
            >
              Read the Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">IH</span>
                </div>
                <span className="font-bold text-xl">InputHaven</span>
              </div>
              <p className="text-gray-600 mb-4 max-w-sm">
                The modern form backend for developers. AI-powered, developer-first, and ready for the future.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://github.com/inputhaven" className="text-gray-400 hover:text-gray-600">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://twitter.com/inputhaven" className="text-gray-400 hover:text-gray-600">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link></li>
                <li><Link href="/changelog" className="text-gray-600 hover:text-gray-900">Changelog</Link></li>
                <li><Link href="/status" className="text-gray-600 hover:text-gray-900">Status</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/docs" className="text-gray-600 hover:text-gray-900">Documentation</Link></li>
                <li><Link href="/docs/api" className="text-gray-600 hover:text-gray-900">API Reference</Link></li>
                <li><Link href="/docs/ufp" className="text-gray-600 hover:text-gray-900">UFP Spec</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-gray-900">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
                <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-gray-900">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} InputHaven. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
