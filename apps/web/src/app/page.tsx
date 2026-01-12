import Link from 'next/link'
import { ArrowRight, Check, Zap, Shield, Bell, Code, BarChart3, Users } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IH</span>
            </div>
            <span className="font-bold text-xl">InputHaven</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/register" 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm mb-6">
            <Zap className="w-4 h-4" />
            Now with AI-powered spam detection
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            The simplest way to add<br />
            <span className="gradient-text">forms to any website</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            No backend required. Just point your form to our endpoint and start receiving 
            submissions with email notifications, spam protection, and powerful integrations.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-lg font-medium"
            >
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/docs"
              className="border px-8 py-4 rounded-lg hover:bg-muted transition-colors text-lg font-medium"
            >
              View Documentation
            </Link>
          </div>
          
          {/* Code example */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-gray-900 rounded-xl p-6 text-left overflow-x-auto">
              <pre className="text-sm text-gray-300">
                <code>{`<form action="https://api.inputhaven.com/v1/submit" method="POST">
  <input type="hidden" name="access_key" value="your-form-key">
  
  <input type="text" name="name" placeholder="Name" required>
  <input type="email" name="email" placeholder="Email" required>
  <textarea name="message" placeholder="Message" required></textarea>
  
  <button type="submit">Send Message</button>
</form>`}</code>
              </pre>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              That&apos;s it! No JavaScript required. Works with any website.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need for form management
            </h2>
            <p className="text-xl text-muted-foreground">
              Powerful features to help you collect, manage, and act on form submissions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'AI Spam Protection',
                description: 'Advanced AI analyzes every submission to filter out spam and bots automatically.'
              },
              {
                icon: Bell,
                title: 'Instant Notifications',
                description: 'Get notified via email, Slack, Discord, or webhooks when new submissions arrive.'
              },
              {
                icon: Code,
                title: 'Easy Integration',
                description: 'Works with any website. Just change your form action URL - no JavaScript needed.'
              },
              {
                icon: BarChart3,
                title: 'Analytics & Insights',
                description: 'Track submission trends, conversion rates, and geographic data.'
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Invite team members, assign submissions, and add internal notes.'
              },
              {
                icon: Zap,
                title: 'Powerful Integrations',
                description: 'Connect with Zapier, Make, Google Sheets, Notion, and more.'
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-xl border card-hover">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free, upgrade as you grow
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                description: 'Perfect for side projects',
                features: [
                  '250 submissions/month',
                  '1 form',
                  'Email notifications',
                  'Basic spam protection',
                  'Community support'
                ]
              },
              {
                name: 'Pro',
                price: '$19',
                description: 'For growing businesses',
                popular: true,
                features: [
                  '25,000 submissions/month',
                  'Unlimited forms',
                  'AI spam protection',
                  'Team collaboration',
                  'Webhooks & integrations',
                  'Priority support'
                ]
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large organizations',
                features: [
                  'Unlimited submissions',
                  'Unlimited forms',
                  'Custom domain',
                  'SLA guarantee',
                  'Dedicated support',
                  'Custom integrations'
                ]
              }
            ].map((plan, i) => (
              <div 
                key={i} 
                className={`p-8 rounded-xl border ${
                  plan.popular 
                    ? 'border-primary bg-primary/5 relative' 
                    : 'bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-muted-foreground">/month</span>}
                </div>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-secondary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-3 rounded-lg transition-colors ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border hover:bg-muted'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to simplify your forms?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who trust InputHaven for their form backend needs.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg font-medium"
          >
            Start for Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IH</span>
              </div>
              <span className="font-bold">InputHaven</span>
            </div>
            
            <nav className="flex items-center gap-6">
              <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </nav>
            
            <p className="text-sm text-muted-foreground">
              © 2024 InputHaven. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
