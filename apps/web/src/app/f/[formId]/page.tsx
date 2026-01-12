import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FormRenderer } from '@/components/embed/form-renderer'
import { PoweredByBadge } from '@/components/embed/powered-by-badge'

// This would fetch from your API in production
async function getForm(formId: string) {
  // Mock data for demonstration - replace with actual API call
  // const response = await fetch(`${process.env.API_URL}/api/forms/${formId}/public`)
  // return response.json()
  
  return {
    id: formId,
    name: 'Contact Form',
    description: 'Get in touch with us',
    isActive: true,
    schema: {
      fields: [
        { id: 'f1', type: 'text', name: 'name', label: 'Full Name', required: true, stepIndex: 0 },
        { id: 'f2', type: 'email', name: 'email', label: 'Email Address', required: true, stepIndex: 0 },
        { id: 'f3', type: 'textarea', name: 'message', label: 'Message', required: true, stepIndex: 0, config: { rows: 4 } },
      ],
      isMultiStep: false,
      steps: [{ id: 's1', title: 'Contact', fields: ['f1', 'f2', 'f3'] }],
      settings: {
        submitButtonText: 'Send Message',
        successMessage: 'Thank you! We\'ll get back to you soon.',
      },
      theme: {
        primaryColor: '#6366f1',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        borderRadius: 'medium',
        fontSize: 'medium',
        spacing: 'normal',
      }
    },
    branding: {
      showPoweredBy: true, // Free plan shows badge
      customLogo: null,
      customDomain: null,
    }
  }
}

// Generate metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: { formId: string } 
}): Promise<Metadata> {
  const form = await getForm(params.formId)
  
  if (!form) {
    return { title: 'Form Not Found' }
  }

  return {
    title: `${form.name} | InputHaven`,
    description: form.description || `Fill out ${form.name}`,
    openGraph: {
      title: form.name,
      description: form.description || `Fill out ${form.name}`,
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    }
  }
}

export default async function HostedFormPage({ 
  params,
  searchParams 
}: { 
  params: { formId: string }
  searchParams: { embed?: string; theme?: string }
}) {
  const form = await getForm(params.formId)
  
  if (!form || !form.isActive) {
    notFound()
  }

  const isEmbedded = searchParams.embed === 'true'
  const themeOverride = searchParams.theme // 'light' | 'dark' | 'auto'

  // Embedded mode - minimal chrome
  if (isEmbedded) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: form.schema.theme.backgroundColor }}>
        <div className="max-w-xl mx-auto p-4">
          <FormRenderer 
            form={form} 
            embedded={true}
            themeOverride={themeOverride}
          />
          {form.branding.showPoweredBy && (
            <PoweredByBadge className="mt-4" />
          )}
        </div>
      </div>
    )
  }

  // Full page mode
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          {form.branding.customLogo ? (
            <img src={form.branding.customLogo} alt="Logo" className="h-8" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IH</span>
              </div>
              <span className="font-bold text-lg text-gray-900">InputHaven</span>
            </div>
          )}
        </div>
      </header>

      {/* Form Container */}
      <main className="max-w-xl mx-auto px-4 py-12">
        <div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          style={{ backgroundColor: form.schema.theme.backgroundColor }}
        >
          {/* Form Header */}
          <div className="p-8 pb-0">
            <h1 
              className="text-2xl font-bold mb-2"
              style={{ color: form.schema.theme.textColor }}
            >
              {form.name}
            </h1>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
          </div>

          {/* Form Body */}
          <div className="p-8">
            <FormRenderer form={form} />
          </div>
        </div>

        {/* Powered By Badge */}
        {form.branding.showPoweredBy && (
          <PoweredByBadge className="mt-6" centered />
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500">
        <p>Secure form powered by InputHaven</p>
        <p className="mt-1">
          <a href="https://inputhaven.com" className="text-indigo-600 hover:underline">
            Create your own form →
          </a>
        </p>
      </footer>
    </div>
  )
}
