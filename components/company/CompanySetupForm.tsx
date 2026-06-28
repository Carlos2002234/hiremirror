'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

const SIZES = [
  { value: 'startup', label: 'Startup (1-10)' },
  { value: 'small', label: 'Pequeña (11-50)' },
  { value: 'medium', label: 'Mediana (51-200)' },
  { value: 'large', label: 'Grande (201-1000)' },
  { value: 'enterprise', label: 'Enterprise (1000+)' },
]

export function CompanySetupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    industry: '',
    size: '',
    website: '',
  })

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/company/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          industry: form.industry.trim() || null,
          size: form.size || null,
          website: form.website.trim() || null,
        }),
      })

      const body = await res.json()
      if (!res.ok) {
        setError(body.error ?? 'Error al crear la empresa')
        return
      }

      router.push('/company/dashboard')
    } catch {
      setError('Error de red. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 ring-1 ring-brand-500/30">
          <Building2 className="h-6 w-6 text-brand-400" />
        </div>
        <CardTitle>Configura tu empresa</CardTitle>
        <CardDescription>
          Completa los datos para empezar a publicar vacantes.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-300">
              Nombre de la empresa <span className="text-danger">*</span>
            </label>
            <Input
              value={form.name}
              onChange={update('name')}
              placeholder="Ej. Acme Security"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-300">Industria</label>
            <Input
              value={form.industry}
              onChange={update('industry')}
              placeholder="Ej. Ciberseguridad, Fintech, Telco..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-300">Tamaño</label>
            <select
              value={form.size}
              onChange={update('size')}
              className="w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2 text-sm text-surface-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Seleccionar...</option>
              {SIZES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-300">Sitio web</label>
            <Input
              type="url"
              value={form.website}
              onChange={update('website')}
              placeholder="https://ejemplo.com"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading || !form.name.trim()}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Creando empresa...' : 'Continuar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
