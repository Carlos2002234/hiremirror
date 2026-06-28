'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'
import { Pencil, Check, X } from 'lucide-react'
import type { Database } from '@/types/supabase'

type ProfileRow = Database['public']['Tables']['candidate_profiles']['Row']
type WorkPref = Database['public']['Tables']['candidate_profiles']['Row']['work_preference']

const SPECIALIZATIONS = [
  'Penetration Testing', 'Red Team', 'SOC / Blue Team', 'Incident Response / DFIR',
  'Cloud Security', 'Application Security', 'Network Security', 'Malware Analysis',
  'Threat Intelligence', 'GRC / Compliance', 'Bug Bounty', 'DevSecOps',
  'OSINT', 'ICS / OT Security',
]

const WORK_PREFS: { value: WorkPref; label: string }[] = [
  { value: 'remote', label: 'Remoto' },
  { value: 'hybrid', label: 'Híbrido' },
  { value: 'onsite', label: 'Presencial' },
  { value: 'any', label: 'Sin preferencia' },
]

interface Props {
  profile: ProfileRow | null
  userId: string
}

export function ProfileEditor({ profile }: Props) {
  const [editing, setEditing] = useState(!profile?.full_name)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [headline, setHeadline] = useState(profile?.headline ?? '')
  const [location, setLocation] = useState(profile?.location ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [yearsExp, setYearsExp] = useState(profile?.years_experience?.toString() ?? '')
  const [primarySpec, setPrimarySpec] = useState(profile?.primary_specialization ?? '')
  const [secondarySpecs, setSecondarySpecs] = useState<string[]>(profile?.secondary_specializations ?? [])
  const [workPref, setWorkPref] = useState<WorkPref>(profile?.work_preference ?? 'remote')
  const [openToWork, setOpenToWork] = useState(profile?.is_open_to_work ?? true)

  function toggleSecondary(spec: string) {
    setSecondarySpecs(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    )
  }

  async function handleSave() {
    if (!fullName.trim()) { setError('El nombre es requerido'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/candidate/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        headline,
        location,
        bio,
        years_experience: yearsExp ? parseInt(yearsExp) : null,
        primary_specialization: primarySpec || null,
        secondary_specializations: secondarySpecs.length ? secondarySpecs : null,
        work_preference: workPref,
        is_open_to_work: openToWork,
      }),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Error guardando')
      return
    }
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!editing) {
    return (
      <div className="space-y-4">
        {saved && (
          <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-4 py-2.5 text-sm text-success">
            <Check className="h-4 w-4" /> Perfil actualizado correctamente
          </div>
        )}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Información personal</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Nombre" value={fullName || '—'} />
            <Row label="Titular" value={headline || '—'} />
            <Row label="Ubicación" value={location || '—'} />
            {bio && (
              <div className="pt-1">
                <p className="text-surface-500 text-xs mb-1">Sobre mí</p>
                <p className="text-surface-300 leading-relaxed">{bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Perfil profesional</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Experiencia" value={yearsExp ? `${yearsExp} años` : '—'} />
            <Row label="Especialización" value={primarySpec || '—'} />
            {secondarySpecs.length > 0 && (
              <div>
                <p className="text-surface-500 text-xs mb-1.5">Secundarias</p>
                <div className="flex flex-wrap gap-1.5">
                  {secondarySpecs.map(s => (
                    <span key={s} className="rounded-full border border-surface-600 px-2.5 py-0.5 text-xs text-surface-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <Row label="Preferencia" value={WORK_PREFS.find(w => w.value === workPref)?.label ?? '—'} />
            <Row label="Disponible" value={openToWork ? 'Sí' : 'No'} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Información personal</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input id="fn" label="Nombre completo *" value={fullName} onChange={e => setFullName(e.target.value)} />
          <Input id="hl" label="Titular profesional" placeholder="Pentester | OSCP | 5 años" value={headline} onChange={e => setHeadline(e.target.value)} />
          <Input id="loc" label="Ubicación" placeholder="San José, Costa Rica" value={location} onChange={e => setLocation(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bio" className="text-sm font-medium text-surface-300">Sobre mí</label>
            <textarea
              id="bio"
              rows={3}
              className="w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Perfil profesional</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input id="yrs" type="number" label="Años de experiencia" min="0" max="50" value={yearsExp} onChange={e => setYearsExp(e.target.value)} />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-300">Especialización principal</label>
            <div className="grid grid-cols-2 gap-2">
              {SPECIALIZATIONS.map(spec => (
                <button key={spec} type="button" onClick={() => setPrimarySpec(spec)}
                  className={cn('rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                    primarySpec === spec
                      ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                      : 'border-surface-600 text-surface-400 hover:border-surface-500 hover:text-surface-300'
                  )}>
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {primarySpec && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-300">Secundarias</label>
              <div className="grid grid-cols-2 gap-2">
                {SPECIALIZATIONS.filter(s => s !== primarySpec).map(spec => (
                  <button key={spec} type="button" onClick={() => toggleSecondary(spec)}
                    className={cn('rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                      secondarySpecs.includes(spec)
                        ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                        : 'border-surface-600 text-surface-400 hover:border-surface-500 hover:text-surface-300'
                    )}>
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-300">Preferencia de trabajo</label>
            <div className="flex gap-2 flex-wrap">
              {WORK_PREFS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => setWorkPref(value)}
                  className={cn('rounded-full border px-4 py-1.5 text-sm transition-colors',
                    workPref === value
                      ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                      : 'border-surface-600 text-surface-400 hover:border-surface-500'
                  )}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-surface-600 bg-surface-800 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-surface-200">Disponible para trabajar</p>
              <p className="text-xs text-surface-500">Las empresas verán tu perfil</p>
            </div>
            <button type="button" onClick={() => setOpenToWork(v => !v)}
              className={cn('relative h-6 w-11 rounded-full transition-colors', openToWork ? 'bg-brand-500' : 'bg-surface-600')}>
              <span className={cn('absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform', openToWork && 'translate-x-5')} />
            </button>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-3">
        {profile?.full_name && (
          <Button variant="secondary" onClick={() => { setEditing(false); setError('') }} disabled={saving}>
            <X className="h-4 w-4" /> Cancelar
          </Button>
        )}
        <Button className="flex-1" onClick={handleSave} loading={saving}>
          <Check className="h-4 w-4" /> Guardar cambios
        </Button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-surface-500 shrink-0">{label}</span>
      <span className="text-surface-200 text-right">{value}</span>
    </div>
  )
}
