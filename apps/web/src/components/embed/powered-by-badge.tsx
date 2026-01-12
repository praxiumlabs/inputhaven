'use client'

import Link from 'next/link'

interface PoweredByBadgeProps {
  className?: string
  centered?: boolean
  dark?: boolean
}

export function PoweredByBadge({ className = '', centered = false, dark = false }: PoweredByBadgeProps) {
  return (
    <div className={`${centered ? 'text-center' : ''} ${className}`}>
      <Link
        href="https://inputhaven.com?ref=badge"
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          dark 
            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <svg 
          className="w-3.5 h-3.5" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect 
            x="3" 
            y="3" 
            width="18" 
            height="18" 
            rx="4" 
            fill="url(#badge-gradient)"
          />
          <path 
            d="M8 12H16M8 8H12M8 16H14" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="badge-gradient" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366f1"/>
              <stop offset="1" stopColor="#8b5cf6"/>
            </linearGradient>
          </defs>
        </svg>
        Powered by InputHaven
      </Link>
    </div>
  )
}

// Minimal version for embedded forms
export function PoweredByBadgeMinimal({ dark = false }: { dark?: boolean }) {
  return (
    <a
      href="https://inputhaven.com?ref=embed"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80 ${
        dark ? 'text-gray-400' : 'text-gray-500'
      }`}
    >
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" opacity="0.3"/>
        <path d="M8 12H16M8 8H12M8 16H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      InputHaven
    </a>
  )
}
