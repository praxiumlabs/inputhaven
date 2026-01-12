import Link from 'next/link'
import { Check, X, HelpCircle, ArrowRight } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for InputHaven. Start free, scale as you grow.'
}

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for personal projects and testing',
    cta: 'Get Started',
    ctaLink: '/register',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 19,
    period: '/month',
    description: 'For growing businesses and teams',
    cta: 'Start Free Trial',
    ctaLink: '/register?plan=pro',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: null,
    period: 'custom',
    description: 'For large organizations with custom needs',
    cta: 'Contact Sales',
    ctaLink: '/contact',
    highlight: false,
  },
]

const FEATURES = [
  {
    category: 'Submissions',
    features: [
      { name: 'Monthly submissions', free: '250', pro: '25,000', enterprise: 'Unlimited' },
      { name: 'Forms', free: '1', pro: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'File uploads', free: '10 MB/file', pro: '25 MB/file', enterprise: '100 MB/file' },
      { name: 'Data retention', free: '30 days', pro: '1 year', enterprise: 'Unlimited' },
    ]
  },
  {
    category: 'Features',
    features: [
      { name: 'Email notifications', free: true, pro: true, enterprise: true },
      { name: 'Basic spam protection', free: true, pro: true, enterprise: true },
      { name: 'AI spam protection', free: false, pro: true, enterprise: true },
      { name: 'Auto-responses', free: false, pro: true, enterprise: true },
      { name: 'Custom redirects', free: true, pro: true, enterprise: true },
      { name: 'AJAX submissions', free: true, pro: true, enterprise: true },
    ]
  },
  {
    category: 'Integrations',
    features: [
      { name: 'Webhooks', free: false, pro: true, enterprise: true },
      { name: 'Slack notifications', free: false, pro: true, enterprise: true },
      { name: 'Discord notifications', free: false, pro: true, enterprise: true },
      { name: 'Zapier / Make / n8n', free: false, pro: true, enterprise: true },
      { name: 'Google Sheets', free: false, pro: true, enterprise: true },
      { name: 'Notion / Airtable', free: false, pro: true, enterprise: true },
      { name: 'HubSpot / Salesforce', free: false, pro: true, enterprise: true },
      { name: 'Custom integrations', free: false, pro: false, enterprise: true },
    ]
  },
  {
    category: 'AI Features',
    features: [
      { name: 'AI classification', free: false, pro: true, enterprise: true },
      { name: 'Sentiment analysis', free: false, pro: true, enterprise: true },
      { name: 'Entity extraction', free: false, pro: true, enterprise: true },
      { name: 'AI summarization', free: false, pro: true, enterprise: true },
      { name: 'Custom AI processors', free: false, pro: false, enterprise: true },
      { name: 'MCP Agent support', free: false, pro: true, enterprise: true },
    ]
  },
  {
    category: 'Team & Security',
    features: [
      { name: 'Team members', free: '1', pro: '10', enterprise: 'Unlimited' },
      { name: 'Workspaces', free: '1', pro: '5', enterprise: 'Unlimited' },
      { name: 'Role-based access', free: false, pro: true, enterprise: true },
      { name: 'Submission assignment', free: false, pro: true, enterprise: true },
      { name: 'Audit logs', free: false, pro: true, enterprise: true },
      { name: 'SSO / SAML', free: false, pro: false, enterprise: true },
      { name: 'Custom domain', free: false, pro: false, enterprise: true },
    ]
  },
  {
    category: 'Support',
    features: [
      { name: 'Community support', free: true, pro: true, enterprise: true },
      { name: 'Email support', free: false, pro: true, enterprise: true },
      { name: 'Priority support', free: false, pro: true, enterprise: true },
      { name: 'Dedicated account manager', free: false, pro: false, enterprise: true },
      { name: 'SLA guarantee', free: false, pro: false, enterprise: true },
      { name: 'Custom onboarding', free: false, pro: false, enterprise: true },
    ]
  },
]

const FAQ = [
  {
    question: 'Can I try Pro features for free?',
    answer: 'Yes! All new accounts get a 14-day free trial of Pro features. No credit card required.'
  },
  {
    question: 'What happens if I exceed my submission limit?',
    answer: 'We\'ll send you a warning at 80% usage. If you exceed the limit, submissions will be queued until the next billing cycle or you upgrade.'
  },
  {
    question: 'Can I switch plans anytime?',
    answer: 'Absolutely. Upgrade instantly, downgrade at the end of your billing cycle. We pro-rate upgrades.'
  },
  {
    question: 'Do you offer discounts for startups or non-profits?',
    answer: 'Yes! Contact us for special pricing for startups, non-profits, and educational institutions.'
  },
  {
    question: 'Is there an annual discount?',
    answer: 'Yes, annual billing saves you 20%. Pay for 10 months, get 12.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards via Stripe. Enterprise customers can pay by invoice.'
  },
]

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 text-green-500 mx-auto" />
    ) : (
      <X className="w-5 h-5 text-gray-300 mx-auto" />
    )
  }
  return <span className="text-gray-900 font-medium">{value}</span>
}

export default function PricingPage() {
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
            <Link href="/pricing" className="text-indigo-600 font-medium">Pricing</Link>
            <Link href="/docs" className="text-gray-600 hover:text-gray-900">Docs</Link>
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
      <section className="py-16 md:py-24 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div 
                key={plan.name}
                className={`rounded-2xl border-2 p-8 ${
                  plan.highlight 
                    ? 'border-indigo-600 bg-indigo-50/50 relative shadow-xl' 
                    : 'border-gray-200'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  {plan.price !== null ? (
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold">${plan.price}</span>
                      <span className="text-gray-500 ml-1">{plan.period}</span>
                    </div>
                  ) : (
                    <div className="text-5xl font-bold">Custom</div>
                  )}
                </div>

                <Link
                  href={plan.ctaLink}
                  className={`block w-full py-3 rounded-xl text-center font-medium transition-colors ${
                    plan.highlight
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>

                {plan.name === 'Pro' && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    14-day free trial • No credit card required
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Compare plans
          </h2>
          
          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 pr-4 font-semibold w-1/3">Features</th>
                  <th className="text-center py-4 px-4 font-semibold w-1/5">Free</th>
                  <th className="text-center py-4 px-4 font-semibold w-1/5 bg-indigo-50">Pro</th>
                  <th className="text-center py-4 px-4 font-semibold w-1/5">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((category) => (
                  <>
                    <tr key={category.category} className="bg-gray-100">
                      <td colSpan={4} className="py-3 px-4 font-semibold text-gray-700">
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature) => (
                      <tr key={feature.name} className="border-b border-gray-200">
                        <td className="py-3 pr-4 text-gray-700">{feature.name}</td>
                        <td className="py-3 px-4 text-center">
                          <FeatureValue value={feature.free} />
                        </td>
                        <td className="py-3 px-4 text-center bg-indigo-50/50">
                          <FeatureValue value={feature.pro} />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <FeatureValue value={feature.enterprise} />
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently asked questions
          </h2>
          
          <div className="max-w-3xl mx-auto grid gap-6">
            {FAQ.map((faq, i) => (
              <div key={i} className="border rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-2 flex items-start gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-gray-600 ml-7">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
            Create your free account in seconds. No credit card required.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl hover:bg-gray-100 font-medium"
          >
            Start for Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
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
