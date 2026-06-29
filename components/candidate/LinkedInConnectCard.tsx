'use client'

import { useState } from 'react'
import { Link2, ExternalLink, Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import type { Database } from '@/types/supabase'

type EvidenceSource = Database['public']['Tables']['evidence_sources']['Row']

interface WorkEntry {
  company: string
  title: string
  start_date: string
  end_date: string
  current: boolean
  description: string
}

function emptyEntry(): WorkEntry {
  return { company: '', title: '', start_date: '', end_date: '', current: false, description: '' }
}

export function LinkedInConnectCard({ source }: { source: EvidenceSource | null }) {
  const existing = source?.processed_data as { linkedin_url?: string; work_experience?: WorkEntry[] } | null

  const [url, setUrl] = useState(existing?.linkedin_url ?? '')
  const [entries, setEntries] = useState<WorkEntry[]>(existing?.work_experience ?? [])
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const connected = !!source && source.status === 'ready'
  const isConnected = connected || status === 'done'

  function addEntry() {
    setEntries(prev => [...prev, emptyEntry()])
  }

  function removeEntry(i: number) {
    setEntries(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateEntry(i: number, field: keyof WorkEntry, value: string | boolean) {
    setEntries(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e))
  }

  async function handleSave() {
    if (!url.trim()) { setErrorMsg('Ingresa tu URL de LinkedIn'); return }
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/candidate/sources/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), work_experience: entries }),
      })
      const body = await res.json()

      if (!res.ok) {
        setErrorMsg(body.error ?? 'Error al guardar')
        setStatus('error')
        return
      }
      setStatus('done')
    } catch {
      setErrorMsg('Error de red.')
      setStatus('error')
    }
  }

  return (
    <Card>
      <CardContent className="py-4 space-y-4">
        {/* Header row */}
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-700">
            <Link2 className="h-4 w-4 text-surface-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-surface-100">LinkedIn</p>
                <p className="text-xs text-surface-500">URL de tu perfil + experiencia laboral</p>
              </div>
              {isConnected && (
                <span className="text-xs font-medium text-success">Guardado</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                id="linkedin-url"
                placeholder="https://linkedin.com/in/tu-perfil"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
              {url && url.includes('linkedin.com') && (
                <a href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center px-2 text-brand-400 hover:text-brand-300">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Work experience section */}
        <div className="space-y-3 ml-13">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">
              Experiencia laboral
              {entries.length > 0 && ` (${entries.length})`}
            </p>
            <Button onClick={addEntry} size="sm" variant="ghost" className="gap-1 text-xs h-7 px-2">
              <Plus className="h-3.5 w-3.5" /> Agregar
            </Button>
          </div>

          {entries.length === 0 && (
            <p className="text-xs text-surface-600">
              Agrega tu experiencia para que la IA la incluya en tu análisis.
            </p>
          )}

          {entries.map((entry, i) => (
            <div key={i} className="rounded-lg border border-surface-700 bg-surface-800/40 p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input id={`title-${i}`} label="Cargo" placeholder="Security Engineer"
                  value={entry.title} onChange={e => updateEntry(i, 'title', e.target.value)} />
                <Input id={`company-${i}`} label="Empresa" placeholder="Nombre de la empresa"
                  value={entry.company} onChange={e => updateEntry(i, 'company', e.target.value)} />
                <Input id={`start-${i}`} label="Inicio (año-mes)" placeholder="2022-01"
                  value={entry.start_date} onChange={e => updateEntry(i, 'start_date', e.target.value)} />
                {!entry.current && (
                  <Input id={`end-${i}`} label="Fin (año-mes)" placeholder="2024-06"
                    value={entry.end_date} onChange={e => updateEntry(i, 'end_date', e.target.value)} />
                )}
              </div>

              <label className="flex items-center gap-2 text-sm text-surface-400 cursor-pointer select-none">
                <input type="checkbox" checked={entry.current}
                  onChange={e => updateEntry(i, 'current', e.target.checked)}
                  className="accent-brand-500 h-4 w-4" />
                Trabajo actual
              </label>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-surface-300">Descripción</label>
                <textarea
                  rows={2}
                  className="w-full resize-none rounded-lg border border-surface-700 bg-surface-800 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="Responsabilidades y logros clave..."
                  value={entry.description}
                  onChange={e => updateEntry(i, 'description', e.target.value)}
                />
              </div>

              <Button onClick={() => removeEntry(i)} size="sm" variant="ghost"
                className="gap-1 text-xs text-danger hover:text-danger h-7 px-2">
                <Trash2 className="h-3.5 w-3.5" /> Eliminar
              </Button>
            </div>
          ))}
        </div>

        {errorMsg && <p className="text-sm text-danger">{errorMsg}</p>}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={status === 'loading'} className="gap-2">
            {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === 'loading' ? 'Guardando...' : isConnected ? 'Actualizar' : 'Guardar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
