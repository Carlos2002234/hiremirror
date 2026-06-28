'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const WORK_TYPES = [
  { value: 'remote', label: 'Remoto' },
  { value: 'hybrid', label: 'Híbrido' },
  { value: 'onsite', label: 'Presencial' },
]

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Tiempo completo' },
  { value: 'part_time', label: 'Medio tiempo' },
  { value: 'contract', label: 'Contrato' },
  { value: 'consulting', label: 'Consultoría' },
]

export function JobPostingForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements_raw: '',
    work_type: 'remote',
    employment_type: 'full_time',
    location: '',
    salary_min: '',
    salary_max: '',
    status: 'draft' as 'draft' | 'active',
  })

  function updateField(field: keyof typeof form) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/company/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          requirements_raw: form.requirements_raw.trim() || null,
          work_type: form.work_type,
          employment_type: form.employment_type,
          location: form.location.trim() || null,
          salary_min: form.salary_min ? Number(form.salary_min) : null,
          salary_max: form.salary_max ? Number(form.salary_max) : null,
          status: form.status,
        }),
      })

      const body = await res.json()
      if (!res.ok) {
        setError(body.error ?? 'Error al crear la vacante')
        return
      }

      router.push('/company/jobs')
      router.refresh()
    } catch {
      setError('Error de red. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const selectCls =
    'w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2 text-sm text-surface-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-300">
              Título del puesto <span className="text-danger">*</span>
            </label>
            <Input
              value={form.title}
              onChange={updateField('title')}
              placeholder="Ej. Senior Penetration Tester"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-300">Modalidad</label>
              <select className={selectCls} value={form.work_type} onChange={updateField('work_type')}>
                {WORK_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-300">Tipo de empleo</label>
              <select className={selectCls} value={form.employment_type} onChange={updateField('employment_type')}>
                {EMPLOYMENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-300">Ubicación</label>
            <Input
              value={form.location}
              onChange={updateField('location')}
              placeholder="Ej. San José, Costa Rica"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-300">Salario mínimo (USD)</label>
              <Input
                type="number"
                value={form.salary_min}
                onChange={updateField('salary_min')}
                placeholder="60000"
                min={0}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-300">Salario máximo (USD)</label>
              <Input
                type="number"
                value={form.salary_max}
                onChange={updateField('salary_max')}
                placeholder="90000"
                min={0}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Descripción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-300">
              Descripción del puesto <span className="text-danger">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={updateField('description')}
              rows={6}
              required
              placeholder="Describe las responsabilidades, el equipo, el impacto del rol..."
              className="w-full resize-none rounded-lg border border-surface-700 bg-surface-800 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-300">
              Requisitos técnicos
              <span className="ml-2 text-xs text-surface-500">(usado por la IA para el matching)</span>
            </label>
            <textarea
              value={form.requirements_raw}
              onChange={updateField('requirements_raw')}
              rows={5}
              placeholder="Lista de skills, certificaciones y experiencia requerida. Puede ser texto libre o copiado de la oferta original."
              className="w-full resize-none rounded-lg border border-surface-700 bg-surface-800 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-surface-300">Estado:</label>
          <div className="flex rounded-lg border border-surface-700 overflow-hidden">
            {(['draft', 'active'] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, status: s }))}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  form.status === s
                    ? 'bg-brand-500 text-white'
                    : 'bg-surface-800 text-surface-400 hover:text-surface-200'
                }`}
              >
                {s === 'draft' ? 'Borrador' : 'Publicar'}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button
          type="submit"
          disabled={loading || !form.title.trim() || !form.description.trim()}
          className="gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Guardando...' : form.status === 'draft' ? 'Guardar borrador' : 'Publicar vacante'}
        </Button>
      </div>
    </form>
  )
}
