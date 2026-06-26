'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error boundary caught:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 px-4">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold tracking-tight">Something went wrong!</h3>
        <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
          An error occurred while rendering this dashboard section. We&apos;ve logged the problem and are looking into it.
        </p>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">
          Reload Page
        </Button>
        <Button onClick={() => reset()} className="rounded-full gap-2">
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  )
}
