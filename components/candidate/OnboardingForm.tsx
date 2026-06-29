'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Upload, CheckCircle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const SPECIALIZATIONS = [
  'Penetration Testing',
  'Red Team',
  'SOC / Blue Team',
  'Incident Response / DFIR',
  'Cloud Security',
  'Application Security',
  'Network Security',
  'Malware Analysis',
  'Threat Intelligence',
  'GRC / Compliance',
  'Bug Bounty',
  'DevSecOps',
  'OSINT',
  'ICS / OT Security',
]

const WORK_PREFS = [
  { value: 'remote', label: 'Remoto' },
  { value: 'hybrid', label: 'Híbrido' },
  { value: 'onsite', label: 'Presencial' },
  { value: 'any', label: 'Sin preferencia' },
] as const

type WorkPref = 'remote' | 'hybrid' | 'onsite' | 'any'

interface Props {
  userId: string
  initialName: string
}

interface StepIndicatorProps {
  step: number
  current: number
  label: string
}

function StepIndicator({ step, current, label }: StepIndicatorProps) {
  const done = step < current
  const active = step === current
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
          done
            ? 'bg-brand-500 text-white'
            : active
            ? 'bg-brand-500/20 text-brand-400 ring-1 ring-brand-500'
            : 'bg-surface-800 text-surface-500'
        )}
      >
        {done ? <CheckCircle className="h-4 w-4" /> : step}
      </div>
      <span className={cn('text-xs', active ? 'text-surface-200' : 'text-surface-500')}>{label}</span>
    </div>
  )
}

export function OnboardingForm({ userId, initialName }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Step 1
  const [fullName, setFullName] = useState(initialName)
  const [headline, setHeadline] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')

  // Step 2
  const [yearsExp, setYearsExp] = useState('')
  const [primarySpec, setPrimarySpec] = useState('')
  const [secondarySpecs, setSecondarySpecs] = useState<string[]>([])
  const [workPref, setWorkPref] = useState<WorkPref>('remote')
  const [openToWork, setOpenToWork] = useState(true)

  // Step 3
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [uploadDone, setUploadDone] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function toggleSecondary(spec: string) {
    setSecondarySpecs(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    )
  }

  async function saveProfile() {
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
      setError(data.error ?? 'Error guardando el perfil')
      return false
    }
    return true
  }

  async function handleStep1Next() {
    if (!fullName.trim()) { setError('El nombre es requerido'); return }
    setError('')
    setStep(2)
  }

  async function handleStep2Next() {
    if (!primarySpec) { setError('Selecciona tu especialización principal'); return }
    setError('')
    const ok = await saveProfile()
    if (ok) setStep(3)
  }

  async function handleCvUpload() {
    if (!cvFile) return
    setSaving(true)
    setUploadError('')
    const form = new FormData()
    form.append('file', cvFile)
    const res = await fetch('/api/candidate/cv', { method: 'POST', body: form })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json()
      setUploadError(data.error ?? 'Error subiendo CV')
      return
    }
    setUploadDone(true)
  }

  async function handleFinish() {
    router.push('/dashboard')
  }

  return (
    <div className="w-full max-w-lg">
      {/* Step indicators */}
      <div className="flex items-start justify-center gap-8 mb-10">
        <StepIndicator step={1} current={step} label="Información" />
        <div className="mt-3.5 h-px w-12 bg-surface-700" />
        <StepIndicator step={2} current={step} label="Profesional" />
        <div className="mt-3.5 h-px w-12 bg-surface-700" />
        <StepIndicator step={3} current={step} label="CV" />
      </div>

      <div className="rounded-2xl border border-surface-700 bg-surface-800/50 p-8">
        {/* ── STEP 1: Personal info ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-surface-50">Cuéntanos sobre ti</h2>
              <p className="mt-1 text-sm text-surface-400">Esta información aparece en tu perfil público.</p>
            </div>
            <Input
              id="fullName"
              label="Nombre completo *"
              placeholder="Carlos Rivera"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
            <Input
              id="headline"
              label="Titular profesional"
              placeholder="Pentester | OSCP | 5 años de experiencia"
              value={headline}
              onChange={e => setHeadline(e.target.value)}
            />
            <Input
              id="location"
              label="Ubicación"
              placeholder="San José, Costa Rica"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="bio" className="text-sm font-medium text-surface-300">Sobre mí</label>
              <textarea
                id="bio"
                rows={3}
                className="w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                placeholder="Profesional de ciberseguridad especializado en..."
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button className="w-full" onClick={handleStep1Next}>
              Continuar <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* ── STEP 2: Professional background ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-surface-50">Perfil profesional</h2>
              <p className="mt-1 text-sm text-surface-400">Ayúdanos a entender tu experiencia y especialización.</p>
            </div>

            <Input
              id="years"
              type="number"
              label="Años de experiencia en ciberseguridad"
              placeholder="5"
              min="0"
              max="50"
              value={yearsExp}
              onChange={e => setYearsExp(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-300">Especialización principal *</label>
              <div className="grid grid-cols-2 gap-2">
                {SPECIALIZATIONS.map(spec => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => setPrimarySpec(spec)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                      primarySpec === spec
                        ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                        : 'border-surface-600 text-surface-400 hover:border-surface-500 hover:text-surface-300'
                    )}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {primarySpec && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-300">Especializaciones secundarias</label>
                <div className="grid grid-cols-2 gap-2">
                  {SPECIALIZATIONS.filter(s => s !== primarySpec).map(spec => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSecondary(spec)}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                        secondarySpecs.includes(spec)
                          ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                          : 'border-surface-600 text-surface-400 hover:border-surface-500 hover:text-surface-300'
                      )}
                    >
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
                  <button
                    key={value}
                    type="button"
                    onClick={() => setWorkPref(value)}
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-sm transition-colors',
                      workPref === value
                        ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                        : 'border-surface-600 text-surface-400 hover:border-surface-500'
                    )}
                  >
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
              <button
                type="button"
                onClick={() => setOpenToWork(v => !v)}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  openToWork ? 'bg-brand-500' : 'bg-surface-600'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                    openToWork && 'translate-x-5'
                  )}
                />
              </button>
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)} disabled={saving}>
                <ChevronLeft className="h-4 w-4" /> Atrás
              </Button>
              <Button className="flex-1" onClick={handleStep2Next} loading={saving}>
                Continuar <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 3: CV Upload ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-surface-50">Sube tu CV</h2>
              <p className="mt-1 text-sm text-surface-400">
                Opcional pero recomendado — la IA extraerá habilidades y experiencia de tu CV.
              </p>
            </div>

            {!uploadDone ? (
              <>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors',
                    cvFile
                      ? 'border-brand-500 bg-brand-500/5'
                      : 'border-surface-600 hover:border-surface-500'
                  )}
                >
                  <Upload className={cn('h-8 w-8', cvFile ? 'text-brand-400' : 'text-surface-500')} />
                  {cvFile ? (
                    <div className="text-center">
                      <p className="text-sm font-medium text-surface-200">{cvFile.name}</p>
                      <p className="text-xs text-surface-500">{(cvFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-surface-300">Haz clic para seleccionar tu CV</p>
                      <p className="text-xs text-surface-500 mt-1">PDF · máx. 10 MB</p>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) { setCvFile(f); setUploadError('') }
                    }}
                  />
                </div>

                {uploadError && <p className="text-sm text-danger">{uploadError}</p>}

                <div className="flex gap-3">
                  {cvFile ? (
                    <Button className="flex-1" onClick={handleCvUpload} loading={saving}>
                      {saving ? 'Subiendo...' : 'Subir CV'}
                    </Button>
                  ) : (
                    <Button variant="ghost" className="flex-1 text-surface-400" onClick={handleFinish}>
                      Omitir por ahora
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle className="h-7 w-7 text-success" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-surface-100">CV subido correctamente</p>
                  <p className="text-sm text-surface-400 mt-1">La IA procesará tu CV en segundo plano.</p>
                </div>
                <Button className="mt-2" onClick={handleFinish}>
                  Ir al dashboard
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
