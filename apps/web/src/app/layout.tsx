import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    default: 'InputHaven - Modern Form Backend',
    template: '%s | InputHaven'
  },
  description: 'The simplest way to add forms to any website. No backend required. AI-powered spam protection, real-time notifications, and powerful integrations.',
  keywords: ['form backend', 'contact form', 'form API', 'form submissions', 'formspree alternative'],
  authors: [{ name: 'InputHaven' }],
  creator: 'InputHaven',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://inputhaven.com',
    title: 'InputHaven - Modern Form Backend',
    description: 'The simplest way to add forms to any website.',
    siteName: 'InputHaven'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InputHaven - Modern Form Backend',
    description: 'The simplest way to add forms to any website.'
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
            toastOptions={{
              duration: 4000
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
