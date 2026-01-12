import Link from 'next/link'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'

export default function FormNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-10 h-10 text-gray-400" />
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Form Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          This form may have been deleted, deactivated, or the link might be incorrect.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Link>
        </div>

        {/* Create form CTA */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            Need to create your own form?
          </p>
          <Link
            href="/signup"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Get started with InputHaven →
          </Link>
        </div>
      </div>
    </div>
  )
}
