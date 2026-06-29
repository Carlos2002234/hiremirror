'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Sparkles, Loader2 } from 'lucide-react'

interface GenerateProfileButtonProps {
  hasCV: boolean
}

export function GenerateProfileButton({ hasCV }: GenerateProfileButtonProps) {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleGenerate() {
    setStatus('loading')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/candidate/analyze-profile', { method: 'POST' })
      const body = await res.json()

      if (!res.ok) {
        setErrorMsg(body.detail ?? body.error ?? 'Ocurrió un error inesperado')
        setStatus('error')
        return
      }

      router.refresh()
    } catch {
      setErrorMsg('Error de red. Verifica tu conexión.')
      setStatus('error')
    }
  }

  if (!hasCV) {
    return (
      <p className="text-sm text-surface-500">
        Sube tu CV en{' '}
        <a href="/sources" className="text-brand-400 underline underline-offset-2">
          Mis fuentes
        </a>{' '}
        para generar tu perfil de IA.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleGenerate}
        disabled={status === 'loading'}
        className="gap-2"
      >
        {status === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {status === 'loading' ? 'Analizando tu CV...' : 'Generar perfil con IA'}
      </Button>

      {status === 'loading' && (
        <p className="text-xs text-surface-500">
          Esto puede tardar 30-60 segundos. No cierres esta página.
        </p>
      )}

      {status === 'error' && errorMsg && (
        <p className="text-xs text-danger">{errorMsg}</p>
      )}
    </div>
  )
}
