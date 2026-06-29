'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      router.push(redirect)
    } catch {
      setError('Error inesperado. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <Card className="space-y-5">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-surface-50">Bienvenido de vuelta</h1>
        <p className="mt-1 text-sm text-surface-400">Ingresa a tu cuenta de HireMirror</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="tu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          id="password"
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger border border-danger/20">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          Iniciar sesión
        </Button>
      </form>

      <p className="text-center text-sm text-surface-400">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-brand-400 hover:text-brand-300 font-medium">
          Regístrate gratis
        </Link>
      </p>
    </Card>
  )
}
