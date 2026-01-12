'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Undo2, 
  Redo2, 
  Eye, 
  Save, 
  MoreVertical,
  Download,
  Upload,
  Share2,
  ExternalLink,
  Loader2,
  Check,
  Layers,
  FileJson
} from 'lucide-react'
import { useBuilder } from './builder-context'
import { ImportModal } from './import-modal'

interface BuilderToolbarProps {
  formId?: string
  onSave?: () => Promise<void>
}

export function BuilderToolbar({ formId, onSave }: BuilderToolbarProps) {
  const { 
    state, 
    undo, 
    redo, 
    canUndo, 
    canRedo, 
    setPreviewMode, 
    toggleMultiStep,
    toggleImportModal,
    updateFormInfo
  } = useBuilder()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleExportJSON = () => {
    const json = JSON.stringify(state.schema, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${state.schema.name.toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
    setShowMenu(false)
  }

  const handleCopyEmbed = () => {
    const embedCode = `<script src="https://cdn.inputhaven.com/embed.js"></script>
<div data-inputhaven-form="${formId || 'YOUR_FORM_ID'}"></div>`
    navigator.clipboard.writeText(embedCode)
    setShowMenu(false)
  }

  return (
    <>
      <div className="h-14 bg-white border-b flex items-center justify-between px-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/forms"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          
          <div className="h-6 w-px bg-gray-200" />
          
          {/* Form Name */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={state.schema.name}
              onChange={e => updateFormInfo(e.target.value)}
              className="font-medium text-gray-900 bg-transparent border-0 focus:ring-0 p-0 focus:outline-none max-w-[200px]"
            />
            {state.isDirty && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Unsaved</span>
            )}
          </div>
        </div>

        {/* Center - Actions */}
        <div className="flex items-center gap-1">
          {/* Undo/Redo */}
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-gray-200 mx-2" />

          {/* Multi-step Toggle */}
          <button
            onClick={() => toggleMultiStep(!state.schema.isMultiStep)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              state.schema.isMultiStep 
                ? 'bg-purple-100 text-purple-700' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={state.schema.isMultiStep ? 'Multi-step enabled' : 'Enable multi-step'}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">
              {state.schema.isMultiStep ? `${state.schema.steps.length} Steps` : 'Single Page'}
            </span>
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Preview Toggle */}
          <button
            onClick={() => setPreviewMode(!state.previewMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              state.previewMode 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Preview</span>
          </button>

          {/* More Options */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-20 py-1">
                  <button
                    onClick={() => { toggleImportModal(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FileJson className="w-4 h-4" />
                    Import / Export
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    Download JSON
                  </button>
                  <button
                    onClick={handleCopyEmbed}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Share2 className="w-4 h-4" />
                    Copy Embed Code
                  </button>
                  <div className="border-t my-1" />
                  {formId && (
                    <a
                      href={`/f/${formId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Form
                    </a>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || !state.isDirty}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {state.showImportModal && (
        <ImportModal onClose={() => toggleImportModal(false)} />
      )}
    </>
  )
}
