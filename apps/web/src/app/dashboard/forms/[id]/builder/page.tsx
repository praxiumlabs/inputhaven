'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  BuilderProvider,
  BuilderToolbar,
  FieldPalette,
  FormCanvas,
  FieldEditor,
  FormSchema
} from '@/components/form-builder'

export default function FormBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [initialSchema, setInitialSchema] = useState<Partial<FormSchema> | null>(null)

  // Load existing form if editing
  useEffect(() => {
    if (formId === 'new') {
      setLoading(false)
      return
    }

    const loadForm = async () => {
      try {
        const response = await fetch(`/api/forms/${formId}`)
        const data = await response.json()
        
        if (data.success && data.data) {
          setInitialSchema({
            id: data.data.id,
            name: data.data.name,
            description: data.data.description,
            fields: data.data.schema?.fields || [],
            isMultiStep: data.data.schema?.isMultiStep || false,
            steps: data.data.schema?.steps || [{ id: 'step_1', title: 'Step 1', fields: [] }],
            settings: {
              submitButtonText: data.data.successMessage ? 'Submit' : 'Submit',
              successMessage: data.data.successMessage || 'Thank you!',
              redirectUrl: data.data.redirectUrl,
              requireAuth: data.data.requireAuth || false,
              honeypotEnabled: true,
              aiSpamProtection: data.data.spamThreshold > 0,
              notifications: {
                email: (data.data.emailTo?.length || 0) > 0,
                emailTo: data.data.emailTo || []
              },
              multiStep: data.data.schema?.settings?.multiStep
            },
            theme: data.data.styling || undefined
          })
        }
      } catch (error) {
        console.error('Failed to load form:', error)
        toast.error('Failed to load form')
      } finally {
        setLoading(false)
      }
    }

    loadForm()
  }, [formId])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        // Trigger save via custom event
        window.dispatchEvent(new CustomEvent('builder:save'))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSave = useCallback(async () => {
    toast.success('Form saved!')
    
    // In real implementation:
    // const response = await fetch(`/api/forms/${formId}`, {
    //   method: formId === 'new' ? 'POST' : 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(schema)
    // })
    // 
    // if (formId === 'new') {
    //   const data = await response.json()
    //   router.push(`/dashboard/forms/${data.id}/builder`)
    // }
  }, [formId, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-500">Loading form builder...</p>
        </div>
      </div>
    )
  }

  return (
    <BuilderProvider initialSchema={initialSchema || undefined}>
      <div className="h-screen flex flex-col bg-gray-100">
        {/* Toolbar */}
        <BuilderToolbar formId={formId !== 'new' ? formId : undefined} onSave={handleSave} />
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Field Palette + Step Navigation */}
          <FieldPalette />
          
          {/* Center - Form Canvas */}
          <FormCanvas />
          
          {/* Right Sidebar - Field Editor */}
          <FieldEditor />
        </div>
      </div>
    </BuilderProvider>
  )
}
