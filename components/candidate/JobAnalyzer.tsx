'use client'

import { useState } from 'react'
import { Loader2, Sparkles, CheckCircle2, AlertTriangle, XCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ScoreBar } from '@/components/ui/ScoreBar'

interface MatchResult {
  job_title: string
  company_name: string
  seniority_required: string
  compatibility_score: number
  technical_match: number
  experience_match: number
  certification_match: number
  recommendation: 'apply' | 'borderline' | 'not_ready'
  summary: string
  matched_skills: string[]
  skill_gaps: string[]
  recommended_certs: string[]
  recommended_labs: string[]
}

const REC_CONFIG = {
  apply: {
    label: 'Aplica ya',
    icon: CheckCircle2,
    variant: 'success' as const,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  borderline: {
    label: 'Borderline',
    icon: AlertTriangle,
    variant: 'warning' as const,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  not_ready: {
    label: 'No listo aún',
    icon: XCircle,
    variant: 'danger' as const,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
}

function scoreColor(v: number) {
  if (v >= 70) return '#10b981'
  if (v >= 45) return '#f59e0b'
  return '#ef4444'
}

export function JobAnalyzer() {
  const [jobText, setJobText] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<MatchResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleAnalyze() {
    if (jobText.trim().length < 50) return
    setStatus('loading')
    setResult(null)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/candidate/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobText }),
      })
      const body = await res.json()

      if (!res.ok) {
        setErrorMsg(body.error ?? 'Ocurrió un error inesperado')
        setStatus('error')
        return
      }

      setResult(body.match as MatchResult)
      setStatus('done')
    } catch {
      setErrorMsg('Error de red. Verifica tu conexión.')
      setStatus('error')
    }
  }

  const rec = result ? REC_CONFIG[result.recommendation] : null
  const overallColor = result ? scoreColor(result.compatibility_score) : '#64748b'

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pega la descripción de la vacante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={jobText}
            onChange={e => setJobText(e.target.value)}
            placeholder="Pega aquí el texto completo de la oferta de trabajo — título, responsabilidades, requisitos, stack tecnológico..."
            rows={10}
            className="w-full resize-none rounded-lg border border-surface-700 bg-surface-800 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-600">
              {jobText.length} caracteres
            </span>
            <Button
              onClick={handleAnalyze}
              disabled={status === 'loading' || jobText.trim().length < 50}
              className="gap-2"
            >
              {status === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {status === 'loading' ? 'Analizando...' : 'Analizar compatibilidad'}
            </Button>
          </div>
          {status === 'loading' && (
            <p className="text-xs text-surface-500">
              Esto puede tardar 20-40 segundos. La IA compara tu perfil con la vacante.
            </p>
          )}
          {status === 'error' && errorMsg && (
            <p className="text-sm text-danger">{errorMsg}</p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && rec && (
        <div className="space-y-4">
          {/* Header: job info + overall score */}
          <div className={`rounded-xl border p-5 ${rec.bg} flex items-center gap-5`}>
            <div className="relative h-20 w-20 shrink-0">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#1e293b" strokeWidth="7" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  strokeWidth="7"
                  stroke={overallColor}
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - result.compatibility_score / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold tabular-nums" style={{ color: overallColor }}>
                  {Math.round(result.compatibility_score)}
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-semibold text-surface-50 truncate">{result.job_title}</h2>
                {result.company_name !== 'Unknown' && (
                  <span className="text-surface-400 text-sm">· {result.company_name}</span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <rec.icon className={`h-4 w-4 shrink-0 ${rec.color}`} />
                <span className={`text-sm font-semibold ${rec.color}`}>{rec.label}</span>
                <Badge variant="default">{result.seniority_required}</Badge>
              </div>
              <p className="text-sm text-surface-300 leading-relaxed">{result.summary}</p>
            </div>
          </div>

          {/* Score breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Breakdown del match</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScoreBar label="Técnico" value={result.technical_match} />
              <ScoreBar label="Experiencia" value={result.experience_match} />
              <ScoreBar label="Certificaciones" value={result.certification_match} />
            </CardContent>
          </Card>

          {/* Skills match + gaps */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Lo que tienes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.matched_skills.length === 0 ? (
                  <p className="text-sm text-surface-500">Sin coincidencias detectadas.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {result.matched_skills.map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-surface-300">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  Lo que te falta
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.skill_gaps.length === 0 ? (
                  <p className="text-sm text-surface-500">¡Sin brechas detectadas!</p>
                ) : (
                  <ul className="space-y-1.5">
                    {result.skill_gaps.map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-surface-300">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {(result.recommended_certs.length > 0 || result.recommended_labs.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-brand-400" />
                  Para mejorar tu match
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {result.recommended_certs.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-2">
                      Certificaciones
                    </p>
                    <ul className="space-y-1.5">
                      {result.recommended_certs.map((c, i) => (
                        <li key={i} className="text-sm text-surface-300 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.recommended_labs.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-2">
                      Labs & práctica
                    </p>
                    <ul className="space-y-1.5">
                      {result.recommended_labs.map((l, i) => (
                        <li key={i} className="text-sm text-surface-300 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                          {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
