'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'
import { User, Building2 } from 'lucide-react'

type Role = 'candidate' | 'recruiter'

function RoleCard({
  role,
  selected,
  onClick,
  title,
  description,
  icon: Icon,
}: {
  role: Role
  selected: boolean
  onClick: () => void
  title: string
  description: string
  icon: React.ElementType
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 flex-col items-center gap-2 rounded-lg border p-4 text-center transition-all',
        selected
          ? 'border-brand-500 bg-brand-500/10 text-brand-300'
          : 'border-surface-600 bg-surface-700/50 text-surface-400 hover:border-surface-500'
      )}
    >
      <Icon className="h-6 w-6" />
      <span className="text-sm font-medium">{title}</span>
      <span className="text-xs opacity-75">{description}</span>
    </button>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [role, setRole] = useState<Role>('candidate')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('role') === 'recruiter') setRole('recruiter')
  }, [])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, full_name: fullName },
        emailRedirectTo: `${window.location.origin}/onboarding/${role}`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <Card className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-lg font-semibold text-surface-50">Revisa tu email</h2>
        <p className="text-sm text-surface-400">
          Te enviamos un enlace de confirmación a <strong className="text-surface-200">{email}</strong>.
          Haz clic en el enlace para activar tu cuenta.
        </p>
        <Link href="/login" className="block text-sm text-brand-400 hover:text-brand-300">
          Volver al login
        </Link>
      </Card>
    )
  }

  return (
    <Card className="space-y-5">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-surface-50">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-surface-400">Gratis para siempre en el plan base</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Role selector */}
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-surface-300">Soy...</span>
          <div className="flex gap-3">
            <RoleCard
              role="candidate"
              selected={role === 'candidate'}
              onClick={() => setRole('candidate')}
              title="Candidato"
              description="Busco trabajo en ciberseguridad"
              icon={User}
            />
            <RoleCard
              role="recruiter"
              selected={role === 'recruiter'}
              onClick={() => setRole('recruiter')}
              title="Empresa"
              description="Contrato talento de seguridad"
              icon={Building2}
            />
          </div>
        </div>

        <Input
          id="fullName"
          type="text"
          label={role === 'candidate' ? 'Nombre completo' : 'Nombre de la empresa'}
          placeholder={role === 'candidate' ? 'Carlos Rivera' : 'Acme Security Inc.'}
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
        />
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
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger border border-danger/20">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          Crear cuenta
        </Button>
      </form>

      <p className="text-center text-sm text-surface-400">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
          Inicia sesión
        </Link>
      </p>
    </Card>
  )
}
