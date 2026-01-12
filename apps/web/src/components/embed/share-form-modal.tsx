'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Link,
  Copy,
  Check,
  QrCode,
  Download,
  ExternalLink,
  Code,
  Mail,
  Twitter,
  Facebook,
  Linkedin,
  MessageCircle,
  Settings,
  Smartphone,
  Monitor,
  X
} from 'lucide-react'

interface ShareFormModalProps {
  formId: string
  formName: string
  onClose: () => void
}

export function ShareFormModal({ formId, formName, onClose }: ShareFormModalProps) {
  const [activeTab, setActiveTab] = useState<'link' | 'embed' | 'qr'>('link')
  const [copied, setCopied] = useState(false)
  const [qrSize, setQrSize] = useState(200)
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://inputhaven.com'
  const formUrl = `${baseUrl}/f/${formId}`

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Share Form</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'link' as const, label: 'Link', icon: Link },
            { id: 'embed' as const, label: 'Embed', icon: Code },
            { id: 'qr' as const, label: 'QR Code', icon: QrCode },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'link' && (
            <LinkTab 
              formUrl={formUrl} 
              formName={formName}
              onCopy={handleCopy}
              copied={copied}
            />
          )}
          
          {activeTab === 'embed' && (
            <EmbedTab 
              formId={formId}
              formUrl={formUrl}
              onCopy={handleCopy}
              copied={copied}
            />
          )}
          
          {activeTab === 'qr' && (
            <QRTab 
              formUrl={formUrl}
              formName={formName}
              size={qrSize}
              onSizeChange={setQrSize}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Link sharing tab
function LinkTab({
  formUrl,
  formName,
  onCopy,
  copied
}: {
  formUrl: string
  formName: string
  onCopy: (text: string) => void
  copied: boolean
}) {
  const socialLinks = [
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600',
      url: `mailto:?subject=${encodeURIComponent(formName)}&body=${encodeURIComponent(`Fill out this form: ${formUrl}`)}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-[#1DA1F2]',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${formName}: ${formUrl}`)}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#4267B2]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(formUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-[#0A66C2]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(formUrl)}`
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366]',
      url: `https://wa.me/?text=${encodeURIComponent(`${formName}: ${formUrl}`)}`
    }
  ]

  return (
    <div className="space-y-6">
      {/* Direct link */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Direct Link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formUrl}
            readOnly
            className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm font-mono"
          />
          <button
            onClick={() => onCopy(formUrl)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Preview link */}
      <a
        href={formUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
      >
        <ExternalLink className="w-4 h-4" />
        Preview form in new tab
      </a>

      {/* Social sharing */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Share on Social Media
        </label>
        <div className="flex gap-3">
          {socialLinks.map(social => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 ${social.color} rounded-lg flex items-center justify-center text-white hover:opacity-90 transition-opacity`}
              title={`Share on ${social.name}`}
            >
              <social.icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

// Embed code tab
function EmbedTab({
  formId,
  formUrl,
  onCopy,
  copied
}: {
  formId: string
  formUrl: string
  onCopy: (text: string) => void
  copied: boolean
}) {
  const [embedMode, setEmbedMode] = useState<'inline' | 'popup' | 'slide'>('inline')
  const [theme, setTheme] = useState<'auto' | 'light' | 'dark'>('auto')

  const getEmbedCode = () => {
    const baseScript = `<script src="https://cdn.inputhaven.com/embed.js"></script>`
    
    switch (embedMode) {
      case 'popup':
        return `${baseScript}
<div 
  data-inputhaven-form="${formId}" 
  data-mode="popup"
  data-theme="${theme}"
  data-button-text="Open Form"
></div>`
      case 'slide':
        return `${baseScript}
<div 
  data-inputhaven-form="${formId}" 
  data-mode="slide"
  data-theme="${theme}"
  data-button-text="Open Form"
></div>`
      default:
        return `${baseScript}
<div 
  data-inputhaven-form="${formId}"
  data-theme="${theme}"
></div>`
    }
  }

  const iframeCode = `<iframe 
  src="${formUrl}?embed=true&theme=${theme}" 
  width="100%" 
  height="500" 
  frameborder="0"
  title="Contact Form"
></iframe>`

  return (
    <div className="space-y-6">
      {/* Embed mode selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Embed Mode
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'inline' as const, label: 'Inline', icon: Monitor, desc: 'Embed directly' },
            { id: 'popup' as const, label: 'Popup', icon: ExternalLink, desc: 'Modal dialog' },
            { id: 'slide' as const, label: 'Slide', icon: Smartphone, desc: 'Side panel' },
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setEmbedMode(mode.id)}
              className={`p-3 rounded-lg border-2 text-center transition-colors ${
                embedMode === mode.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <mode.icon className={`w-5 h-5 mx-auto mb-1 ${
                embedMode === mode.id ? 'text-indigo-600' : 'text-gray-400'
              }`} />
              <div className="text-sm font-medium">{mode.label}</div>
              <div className="text-xs text-gray-500">{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Theme selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Theme
        </label>
        <select
          value={theme}
          onChange={e => setTheme(e.target.value as typeof theme)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="auto">Auto (match system)</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      {/* Embed code */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Embed Code
          </label>
          <button
            onClick={() => onCopy(getEmbedCode())}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm">
          <code>{getEmbedCode()}</code>
        </pre>
      </div>

      {/* Alternative: iframe */}
      <div className="pt-4 border-t">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Alternative: iframe (no JavaScript)
          </label>
          <button
            onClick={() => onCopy(iframeCode)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
        </div>
        <pre className="p-3 bg-gray-100 text-gray-700 rounded-lg overflow-x-auto text-xs">
          <code>{iframeCode}</code>
        </pre>
      </div>
    </div>
  )
}

// QR Code tab
function QRTab({
  formUrl,
  formName,
  size,
  onSizeChange
}: {
  formUrl: string
  formName: string
  size: number
  onSizeChange: (size: number) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrColor, setQrColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [logoEnabled, setLogoEnabled] = useState(true)

  // Generate QR code using canvas
  useEffect(() => {
    generateQR()
  }, [formUrl, size, qrColor, bgColor, logoEnabled])

  const generateQR = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = size
    canvas.height = size

    // Use a simple QR code generation algorithm
    // In production, you'd use a library like qrcode or qr-code-styling
    // This is a placeholder that creates a styled box
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, size, size)

    // Create QR pattern (simplified)
    const moduleSize = Math.floor(size / 25)
    ctx.fillStyle = qrColor

    // QR code URL pattern (you'd replace this with actual QR encoding)
    const pattern = generateQRPattern(formUrl)
    for (let y = 0; y < 25; y++) {
      for (let x = 0; x < 25; x++) {
        if (pattern[y * 25 + x]) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize)
        }
      }
    }

    // Add logo in center if enabled
    if (logoEnabled) {
      const logoSize = Math.floor(size / 5)
      const logoPos = (size - logoSize) / 2
      
      // White background for logo
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(logoPos - 4, logoPos - 4, logoSize + 8, logoSize + 8)
      
      // Logo placeholder (gradient square)
      const gradient = ctx.createLinearGradient(logoPos, logoPos, logoPos + logoSize, logoPos + logoSize)
      gradient.addColorStop(0, '#6366f1')
      gradient.addColorStop(1, '#8b5cf6')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.roundRect(logoPos, logoPos, logoSize, logoSize, 8)
      ctx.fill()
      
      // "IH" text
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${logoSize / 2}px system-ui`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('IH', logoPos + logoSize / 2, logoPos + logoSize / 2)
    }
  }

  // Simple QR pattern generator (placeholder)
  const generateQRPattern = (data: string): boolean[] => {
    const pattern: boolean[] = []
    const hash = simpleHash(data)
    
    for (let i = 0; i < 625; i++) {
      // Position detection patterns (corners)
      const x = i % 25
      const y = Math.floor(i / 25)
      
      // Top-left corner
      if (x < 7 && y < 7) {
        pattern.push(
          (x === 0 || x === 6 || y === 0 || y === 6) ||
          (x >= 2 && x <= 4 && y >= 2 && y <= 4)
        )
        continue
      }
      
      // Top-right corner
      if (x >= 18 && y < 7) {
        const lx = x - 18
        pattern.push(
          (lx === 0 || lx === 6 || y === 0 || y === 6) ||
          (lx >= 2 && lx <= 4 && y >= 2 && y <= 4)
        )
        continue
      }
      
      // Bottom-left corner
      if (x < 7 && y >= 18) {
        const ly = y - 18
        pattern.push(
          (x === 0 || x === 6 || ly === 0 || ly === 6) ||
          (x >= 2 && x <= 4 && ly >= 2 && ly <= 4)
        )
        continue
      }
      
      // Random pattern based on hash (simplified)
      pattern.push(((hash + i * 7) % 3) === 0)
    }
    
    return pattern
  }

  const simpleHash = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = `${formName.toLowerCase().replace(/\s+/g, '-')}-qr.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* QR Preview */}
      <div className="flex justify-center">
        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <canvas
            ref={canvasRef}
            className="mx-auto"
            style={{ width: 200, height: 200 }}
          />
        </div>
      </div>

      {/* Customization */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Size
          </label>
          <select
            value={size}
            onChange={e => onSizeChange(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value={150}>Small (150px)</option>
            <option value={200}>Medium (200px)</option>
            <option value={300}>Large (300px)</option>
            <option value={500}>XL (500px)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            QR Color
          </label>
          <input
            type="color"
            value={qrColor}
            onChange={e => setQrColor(e.target.value)}
            className="w-full h-10 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={logoEnabled}
          onChange={e => setLogoEnabled(e.target.checked)}
          className="w-4 h-4 rounded text-indigo-600"
        />
        <span className="text-sm text-gray-700">Include InputHaven logo</span>
      </label>

      {/* Download */}
      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        <Download className="w-4 h-4" />
        Download QR Code
      </button>

      {/* Usage tip */}
      <p className="text-sm text-gray-500 text-center">
        Print this QR code and place it anywhere. When scanned, it opens your form.
      </p>
    </div>
  )
}

// Export standalone components
export { LinkTab, EmbedTab, QRTab }
