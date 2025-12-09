
'use client'

import { useEffect } from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log exception to monitoring service
        console.error('Global Error caught:', error)
    }, [error])

    return (
        <html>
            <body className="bg-neutral-900 text-white flex items-center justify-center min-h-screen">
                <div className="text-center p-8 bg-neutral-800 rounded-2xl border border-neutral-700 max-w-md mx-4">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong!</h2>
                    <p className="text-zinc-400 mb-6 text-sm">
                        We encountered a critical error. Please try refreshing the page.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => reset()}
                            className="px-6 py-3 bg-neutral-700 text-white rounded-xl hover:bg-neutral-600 transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-6 py-3 bg-emerald-500 text-neutral-900 font-bold rounded-xl hover:bg-emerald-400 transition-colors"
                        >
                            Go Home
                        </button>
                    </div>
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 text-left bg-black p-4 rounded overflow-auto max-h-48">
                            <p className="font-mono text-xs text-red-400 whitespace-pre-wrap">{error.message}</p>
                        </div>
                    )}
                </div>
            </body>
        </html>
    )
}
