import Link from 'next/link'
import { ArrowRight, ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quick Start',
  description: 'Get started with InputHaven in under 5 minutes.'
}

export default function QuickStartPage() {
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
            <Link href="/docs" className="text-gray-600 font-medium hover:text-gray-900">Docs</Link>
          </div>
          
          <Link href="/dashboard" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/docs" className="hover:text-gray-900">Docs</Link>
            <span>/</span>
            <span className="text-gray-900">Quick Start</span>
          </nav>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-4">Quick Start</h1>
          <p className="text-xl text-gray-600 mb-8">
            Get your first form up and running in under 5 minutes.
          </p>

          {/* Steps */}
          <div className="space-y-12">
            {/* Step 1 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-2xl font-bold">Create an account</h2>
              </div>
              <p className="text-gray-600 mb-4 ml-11">
                Sign up for a free InputHaven account. No credit card required.
              </p>
              <div className="ml-11">
                <Link 
                  href="/register"
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </section>

            {/* Step 2 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-2xl font-bold">Create a form</h2>
              </div>
              <p className="text-gray-600 mb-4 ml-11">
                Go to your dashboard and click "New Form". Give it a name and configure your settings.
              </p>
              <div className="ml-11 bg-gray-50 rounded-xl p-4 border">
                <p className="text-sm text-gray-600 mb-2">After creating your form, you'll get a unique form ID:</p>
                <code className="bg-gray-900 text-green-400 px-4 py-2 rounded-lg block text-sm font-mono">
                  f_cly1234567890abcdef
                </code>
              </div>
            </section>

            {/* Step 3 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h2 className="text-2xl font-bold">Add the form to your website</h2>
              </div>
              <p className="text-gray-600 mb-4 ml-11">
                Point your HTML form's <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">action</code> attribute to our endpoint:
              </p>
              
              {/* Code Block */}
              <div className="ml-11 bg-gray-900 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-400 text-sm">
                  <span>HTML</span>
                  <button className="hover:text-white flex items-center gap-1">
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto">
                  <code className="text-sm text-gray-300">
{`<form 
  action="https://api.inputhaven.com/v1/submit/f_YOUR_FORM_ID" 
  method="POST"
>
  <label for="name">Name</label>
  <input type="text" name="name" id="name" required />
  
  <label for="email">Email</label>
  <input type="email" name="email" id="email" required />
  
  <label for="message">Message</label>
  <textarea name="message" id="message"></textarea>
  
  <button type="submit">Send</button>
</form>`}
                  </code>
                </pre>
              </div>
            </section>

            {/* Step 4 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <h2 className="text-2xl font-bold">That's it!</h2>
              </div>
              <p className="text-gray-600 mb-4 ml-11">
                Submit your form and check your dashboard. You should see your first submission appear immediately.
              </p>
              <div className="ml-11 bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Your form is now live!</p>
                    <p className="text-sm text-green-600">Submissions will appear in your dashboard in real-time.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Next Steps */}
          <section className="mt-16 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-6">Next Steps</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'Add spam protection', href: '/docs/spam-protection', description: 'Enable AI-powered spam filtering' },
                { title: 'Set up notifications', href: '/docs/notifications', description: 'Get notified via email or Slack' },
                { title: 'Connect integrations', href: '/docs/integrations', description: 'Send data to Zapier, Notion, etc.' },
                { title: 'Use the React SDK', href: '/docs/react', description: 'Build forms with React components' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between p-4 border rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors group"
                >
                  <div>
                    <h3 className="font-semibold group-hover:text-indigo-600">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600" />
                </Link>
              ))}
            </div>
          </section>

          {/* Navigation */}
          <nav className="mt-12 pt-8 border-t flex items-center justify-between">
            <Link 
              href="/docs/introduction"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Introduction
            </Link>
            <Link 
              href="/docs/concepts"
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
            >
              Concepts
              <ArrowRight className="w-4 h-4" />
            </Link>
          </nav>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} InputHaven. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
