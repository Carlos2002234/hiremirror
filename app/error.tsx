'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry?: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-900 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10 ring-1 ring-danger/30 mb-6">
        <AlertTriangle className="h-8 w-8 text-danger" />
      </div>
      <h1 className="text-xl font-semibold text-surface-200">Algo salió mal</h1>
      <p className="mt-2 text-sm text-surface-500 max-w-sm">
        Ocurrió un error inesperado. Intenta de nuevo o contacta soporte si el problema persiste.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-surface-700 font-mono">{error.digest}</p>
      )}
      <div className="mt-8 flex gap-3">
        {unstable_retry && <Button onClick={unstable_retry}>Intentar de nuevo</Button>}
        <Button variant="ghost" onClick={() => window.location.href = '/'}>
          Ir al inicio
        </Button>
      </div>
    </div>
  )
}
