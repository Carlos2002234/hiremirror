'use client'

import { useState } from 'react'
import { Loader2, Sparkles, Copy, Check, ChevronDown, ChevronUp, AlertTriangle, TrendingUp, Zap, Search, Link2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ScoreBar } from '@/components/ui/ScoreBar'

interface SectionScore {
  score: number
  issues?: string[]
  tips?: string[]
  recommendations?: string[]
  improvements?: string[]
  strengths?: string[]
  missing_keywords?: string[]
  remove_suggestions?: string[]
  improved?: string
  current?: string
}

interface Analysis {
  overall_score: number
  narrative_summary: string
  headline: SectionScore & { current: string; improved: string }
  summary: SectionScore & { improved: string }
  skills: SectionScore
  experience: SectionScore
  personal_brand: SectionScore
  quick_wins: string[]
  ats_keywords: string[]
}

function scoreColor(v: number) {
  if (v >= 70) return 'text-score-high'
  if (v >= 45) return 'text-score-mid'
  return 'text-score-low'
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}

function CollapsibleSection({ title, score, children }: { title: string; score: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <Card>
      <button onClick={() => setOpen(v => !v)} className="w-full text-left">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{title}</CardTitle>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold ${scoreColor(score)}`}>{score}/100</span>
              {open ? <ChevronUp className="h-4 w-4 text-surface-500" /> : <ChevronDown className="h-4 w-4 text-surface-500" />}
            </div>
          </div>
          <ScoreBar label="" value={score} />
        </CardHeader>
      </button>
      {open && <CardContent className="pt-0 space-y-3">{children}</CardContent>}
    </Card>
  )
}

function IssueList({ items, label }: { items?: string[]; label: string }) {
  if (!items?.length) return null
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">{label}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ImprovedBlock({ text, label = 'Versión mejorada' }: { text: string; label?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">{label}</p>
        <CopyButton text={text} />
      </div>
      <div className="rounded-lg border border-brand-500/20 bg-brand-500/5 px-4 py-3 text-sm text-surface-100 leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
    </div>
  )
}

export function LinkedInOptimizer({ specialization }: { specialization: string | null }) {
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [profileText, setProfileText] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error' | 'no_key'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [scraped, setScraped] = useState(false)

  async function handleAnalyze() {
    const hasUrl = linkedinUrl.trim().includes('linkedin.com/in/')
    const hasText = profileText.trim().length >= 100
    if (!hasUrl && !hasText) return

    setStatus('loading')
    setErrorMsg('')
    setAnalysis(null)

    try {
      const res = await fetch('/api/candidate/linkedin-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedinUrl: hasUrl ? linkedinUrl.trim() : undefined,
          profileText: !hasUrl && hasText ? profileText : undefined,
          targetRole,
        }),
      })
      const body = await res.json()

      if (body.error === 'PROXYCURL_NOT_CONFIGURED') {
        setStatus('no_key')
        setShowManual(true)
        return
      }

      if (!res.ok) {
        setErrorMsg(body.detail ?? body.error ?? 'Error inesperado')
        setStatus('error')
        return
      }

      setAnalysis(body.analysis as Analysis)
      setScraped(body.scraped === true)
      setStatus('done')
    } catch {
      setErrorMsg('Error de red. Verifica tu conexión.')
      setStatus('error')
    }
  }

  const canSubmit = linkedinUrl.trim().includes('linkedin.com/in/') || profileText.trim().length >= 100
  const overallColor = analysis
    ? analysis.overall_score >= 70 ? '#10b981' : analysis.overall_score >= 45 ? '#f59e0b' : '#ef4444'
    : '#64748b'

  return (
    <div className="space-y-6">
      {/* Input card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4 text-brand-400" />
            Analiza tu perfil de LinkedIn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL input — primary mode */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-300">URL de tu perfil</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/tu-usuario"
                className="flex-1 rounded-lg border border-surface-700 bg-surface-800 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <p className="text-xs text-surface-600">
              Tu perfil debe ser público para que la IA pueda leerlo.
            </p>
          </div>

          {/* No Proxycurl key banner */}
          {status === 'no_key' && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
              <p className="text-sm font-medium text-amber-400">Scraping automático no configurado</p>
              <p className="text-xs text-surface-400">
                Para usar el análisis automático por URL, agrega{' '}
                <code className="bg-surface-700 px-1 py-0.5 rounded text-xs">PROXYCURL_API_KEY</code>{' '}
                en las variables de entorno de Vercel. Puedes obtener una key gratuita en{' '}
                <span className="text-brand-400">nubela.co/proxycurl</span>.
              </p>
              <p className="text-sm text-surface-300 mt-2">
                Por ahora, pega el texto de tu perfil manualmente:
              </p>
            </div>
          )}

          {/* Manual paste — shown when no key or user requests it */}
          {(showManual || status === 'no_key') && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-300">
                O pega el texto de tu perfil
                <span className="ml-2 text-xs text-surface-500 font-normal">
                  (LinkedIn → selecciona todo → Ctrl+C → pega aquí)
                </span>
              </label>
              <textarea
                value={profileText}
                onChange={e => setProfileText(e.target.value)}
                placeholder="Pega aquí todo el texto de tu perfil de LinkedIn..."
                rows={8}
                className="w-full resize-none rounded-lg border border-surface-700 bg-surface-800 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <p className="text-xs text-surface-600">{profileText.length} caracteres</p>
            </div>
          )}

          {/* Toggle manual paste */}
          {!showManual && status !== 'no_key' && (
            <button
              onClick={() => setShowManual(true)}
              className="flex items-center gap-1 text-xs text-surface-500 hover:text-surface-300 transition-colors"
            >
              <ChevronRight className="h-3 w-3" />
              Pegar texto manualmente en su lugar
            </button>
          )}

          {/* Target role */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-300">
              Rol objetivo <span className="font-normal text-surface-500">(opcional)</span>
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder={`Ej: ${specialization ?? 'Penetration Tester'} en empresa fintech`}
              className="w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            {status === 'loading' && (
              <p className="text-xs text-surface-500">Esto puede tardar 30-50s…</p>
            )}
            <Button onClick={handleAnalyze} disabled={status === 'loading' || !canSubmit} className="gap-2">
              {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {status === 'loading' ? 'Analizando...' : 'Analizar perfil'}
            </Button>
          </div>

          {status === 'error' && errorMsg && (
            <p className="text-sm text-danger">{errorMsg}</p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Overall score */}
          <div className="rounded-xl border border-surface-700 bg-surface-800/50 p-5 flex items-center gap-5">
            <div className="relative h-24 w-24 shrink-0">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#1e293b" strokeWidth="7" />
                <circle cx="40" cy="40" r="34" fill="none" strokeWidth="7" stroke={overallColor}
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - analysis.overall_score / 100)} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold tabular-nums" style={{ color: overallColor }}>
                  {analysis.overall_score}
                </span>
                <span className="text-xs text-surface-500">/100</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-surface-50">Score de tu perfil LinkedIn</h2>
                {scraped && (
                  <span className="text-xs bg-success/10 text-success border border-success/20 rounded px-1.5 py-0.5">
                    Analizado automáticamente
                  </span>
                )}
              </div>
              <p className="text-sm text-surface-300 leading-relaxed">{analysis.narrative_summary}</p>
            </div>
          </div>

          {/* Quick wins */}
          {analysis.quick_wins?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-amber-400">
                  <Zap className="h-4 w-4" />
                  Quick wins — cambios de alto impacto en {'<'} 5 minutos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {analysis.quick_wins.map((win, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-surface-300">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-400">
                        {i + 1}
                      </span>
                      {win}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* ATS keywords */}
          {analysis.ats_keywords?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Search className="h-4 w-4 text-brand-400" />
                  Keywords que te faltan para ATS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.ats_keywords.map((kw, i) => (
                    <Badge key={i} variant="default">{kw}</Badge>
                  ))}
                </div>
                <p className="mt-3 text-xs text-surface-500">
                  Agrega estas palabras clave en tu resumen, habilidades o experiencia para mejorar tu visibilidad en búsquedas.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Headline */}
          <CollapsibleSection title="Headline" score={analysis.headline.score}>
            {analysis.headline.current && (
              <div className="text-sm text-surface-400 italic border-l-2 border-surface-700 pl-3">
                &ldquo;{analysis.headline.current}&rdquo;
              </div>
            )}
            <IssueList items={analysis.headline.issues} label="Problemas detectados" />
            {analysis.headline.improved && <ImprovedBlock text={analysis.headline.improved} />}
          </CollapsibleSection>

          {/* Summary */}
          <CollapsibleSection title="Resumen / About" score={analysis.summary.score}>
            <IssueList items={analysis.summary.issues} label="Problemas detectados" />
            {analysis.summary.improved && <ImprovedBlock text={analysis.summary.improved} label="Resumen mejorado" />}
          </CollapsibleSection>

          {/* Skills */}
          <CollapsibleSection title="Habilidades" score={analysis.skills.score}>
            {(analysis.skills.missing_keywords?.length ?? 0) > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">Keywords faltantes</p>
                <div className="flex flex-wrap gap-2">
                  {(analysis.skills.missing_keywords ?? []).map((kw, i) => (
                    <span key={i} className="rounded border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 text-xs text-brand-300">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(analysis.skills.remove_suggestions?.length ?? 0) > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">Considera eliminar</p>
                <div className="flex flex-wrap gap-2">
                  {(analysis.skills.remove_suggestions ?? []).map((kw, i) => (
                    <span key={i} className="rounded border border-danger/30 bg-danger/5 px-2 py-0.5 text-xs text-danger/70 line-through">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {analysis.skills.recommendations?.map((rec, i) => (
              <p key={i} className="text-sm text-surface-300">{rec}</p>
            ))}
          </CollapsibleSection>

          {/* Experience */}
          <CollapsibleSection title="Experiencia" score={analysis.experience.score}>
            <IssueList items={analysis.experience.issues} label="Problemas detectados" />
            {(analysis.experience.tips?.length ?? 0) > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">Tips para mejorar</p>
                <ul className="space-y-1.5">
                  {(analysis.experience.tips ?? []).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                      <TrendingUp className="h-3.5 w-3.5 text-brand-400 mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CollapsibleSection>

          {/* Personal brand */}
          <CollapsibleSection title="Marca personal" score={analysis.personal_brand.score}>
            {(analysis.personal_brand.strengths?.length ?? 0) > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">Fortalezas</p>
                <ul className="space-y-1">
                  {(analysis.personal_brand.strengths ?? []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success mt-2" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(analysis.personal_brand.improvements?.length ?? 0) > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">Áreas de mejora</p>
                <ul className="space-y-1">
                  {(analysis.personal_brand.improvements ?? []).map((imp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400 mt-2" />
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CollapsibleSection>
        </div>
      )}
    </div>
  )
}
