import Link from 'next/link'
import { ArrowRight, Check, Zap, Shield, Globe, Code, BarChart3, Webhook, Mail, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xl">
              📥
            </div>
            <span className="text-xl font-bold text-gray-900">InputHaven</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/docs" className="text-sm font-medium text-gray-600 hover:text-gray-900">Docs</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Log in
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Now with AI-powered spam detection</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
              Form backend for the
              <span className="gradient-text"> modern web</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Add powerful forms to any website in minutes. No backend code required. 
              Real-time notifications, AI spam protection, and seamless integrations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-white font-semibold text-lg hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2"
              >
                Start for free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                See it in action
              </Link>
            </div>

            {/* Code Preview */}
            <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-gray-900/10">
              <div className="bg-gray-900 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-gray-400 text-sm">index.html</span>
              </div>
              <pre className="bg-gray-950 p-6 text-left overflow-x-auto">
                <code className="text-sm leading-relaxed">
                  <span className="text-gray-500">&lt;!-- Just add this to your HTML --&gt;</span>{'\n'}
                  <span className="text-pink-400">&lt;form</span> <span className="text-purple-300">action</span>=<span className="text-green-300">"https://inputhaven.com/v1/submit"</span>{'\n'}
                  {'      '}<span className="text-purple-300">method</span>=<span className="text-green-300">"POST"</span><span className="text-pink-400">&gt;</span>{'\n'}
                  {'  '}<span className="text-pink-400">&lt;input</span> <span className="text-purple-300">type</span>=<span className="text-green-300">"hidden"</span> <span className="text-purple-300">name</span>=<span className="text-green-300">"access_key"</span>{'\n'}
                  {'         '}<span className="text-purple-300">value</span>=<span className="text-green-300">"your-form-key"</span> <span className="text-pink-400">/&gt;</span>{'\n'}
                  {'\n'}
                  {'  '}<span className="text-pink-400">&lt;input</span> <span className="text-purple-300">type</span>=<span className="text-green-300">"email"</span> <span className="text-purple-300">name</span>=<span className="text-green-300">"email"</span> <span className="text-purple-300">required</span> <span className="text-pink-400">/&gt;</span>{'\n'}
                  {'  '}<span className="text-pink-400">&lt;textarea</span> <span className="text-purple-300">name</span>=<span className="text-green-300">"message"</span><span className="text-pink-400">&gt;&lt;/textarea&gt;</span>{'\n'}
                  {'  '}<span className="text-pink-400">&lt;button&gt;</span><span className="text-gray-300">Send</span><span className="text-pink-400">&lt;/button&gt;</span>{'\n'}
                  <span className="text-pink-400">&lt;/form&gt;</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50M+', label: 'Forms processed' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '<100ms', label: 'Avg response' },
              { value: '10K+', label: 'Happy developers' }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need</h2>
            <p className="text-xl text-gray-600">Powerful features to handle all your form needs</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Instant Notifications', description: 'Get submissions in your inbox within milliseconds. Beautiful HTML emails with all the data.' },
              { icon: Shield, title: 'AI Spam Protection', description: 'Advanced machine learning blocks spam while letting real submissions through.' },
              { icon: Webhook, title: 'Webhooks & Integrations', description: 'Send data to Slack, Discord, Notion, Zapier, or any URL automatically.' },
              { icon: BarChart3, title: 'Real-time Analytics', description: 'Track submissions, conversion rates, and trends with beautiful dashboards.' },
              { icon: Code, title: 'Developer Friendly', description: 'REST API, SDKs, and extensive documentation. Build anything you can imagine.' },
              { icon: Globe, title: 'Global CDN', description: 'Lightning-fast form submissions from anywhere in the world.' }
            ].map((feature) => (
              <div key={feature.title} className="p-8 rounded-2xl border bg-white card-hover">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-gray-600">Start free, upgrade when you need more</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { name: 'Free', price: '$0', submissions: '250/mo', forms: '1 form', features: ['Email notifications', 'Spam protection', 'Custom redirect'] },
              { name: 'Starter', price: '$9', submissions: '2,500/mo', forms: '10 forms', features: ['Everything in Free', 'File uploads', 'Webhooks', 'API access'] },
              { name: 'Pro', price: '$29', submissions: '25,000/mo', forms: 'Unlimited', features: ['Everything in Starter', 'AI features', 'Remove branding', 'Priority support'], popular: true },
              { name: 'Enterprise', price: '$99', submissions: 'Unlimited', forms: 'Unlimited', features: ['Everything in Pro', '99.9% SLA', 'SSO & Teams', 'Custom integrations'] }
            ].map((plan) => (
              <div 
                key={plan.name} 
                className={`p-8 rounded-2xl border bg-white ${plan.popular ? 'border-primary shadow-xl shadow-primary/10 scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="text-xs font-bold text-primary uppercase tracking-wide mb-4">Most Popular</div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <div className="text-sm text-gray-500 mb-6">
                  <div>{plan.submissions}</div>
                  <div>{plan.forms}</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                      <Check className="w-5 h-5 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full py-3 rounded-lg font-semibold text-center transition-colors ${
                    plan.popular 
                      ? 'bg-primary text-white hover:bg-primary/90' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to simplify your forms?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of developers who trust InputHaven. Free forever plan available.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold text-lg hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
          >
            Get started free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-sm">
                📥
              </div>
              <span className="font-semibold text-gray-900">InputHaven</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-900">Terms</Link>
              <Link href="/docs" className="hover:text-gray-900">Documentation</Link>
              <Link href="/status" className="hover:text-gray-900">Status</Link>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} InputHaven. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
