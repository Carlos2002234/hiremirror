import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle2, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ScoreBar } from '@/components/ui/ScoreBar'
import { GenerateProfileButton } from '@/components/candidate/GenerateProfileButton'
import type { Database } from '@/types/supabase'

export const metadata = { title: 'Mi score · HireMirror' }

type AiProfile = Database['public']['Tables']['ai_profiles']['Row']

function scoreColor(v: number) {
  if (v >= 70) return '#10b981'
  if (v >= 45) return '#f59e0b'
  return '#ef4444'
}

function seniorityVariant(s: string): 'default' | 'success' | 'warning' | 'brand' {
  if (s === 'principal' || s === 'staff') return 'success'
  if (s === 'senior') return 'brand'
  if (s === 'mid') return 'warning'
  return 'default'
}

function seniorityLabel(s: string): string {
  const map: Record<string, string> = {
    junior: 'Junior',
    mid: 'Mid-level',
    senior: 'Senior',
    staff: 'Staff',
    principal: 'Principal',
  }
  return map[s] ?? s
}

function toStringArray(json: unknown): string[] {
  if (!Array.isArray(json)) return []
  return json.filter((x): x is string => typeof x === 'string')
}

export default async function ScoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('candidate_profiles')
    .select('id, full_name')
    .eq('user_id', user.id)
    .single()

  const profile = profileRaw as { id: string; full_name: string | null } | null
  if (!profile) redirect('/onboarding/candidate')

  const { data: aiRaw } = await supabase
    .from('ai_profiles')
    .select('*')
    .eq('candidate_id', profile.id)
    .single()

  const ai = aiRaw as AiProfile | null

  const { data: sourcesRaw } = await supabase
    .from('evidence_sources')
    .select('source_type')
    .eq('candidate_id', profile.id)

  const hasCV = (sourcesRaw ?? []).some(
    (s: { source_type: string }) => s.source_type === 'cv',
  )

  if (!ai) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-surface-50">Mi score</h1>
        <Card className="border-dashed border-surface-600 bg-transparent text-center">
          <CardContent className="py-16 space-y-4">
            <TrendingUp className="mx-auto h-12 w-12 text-surface-600" />
            <p className="font-medium text-surface-300">Aún no tienes un perfil de IA generado</p>
            <p className="text-sm text-surface-500">
              {hasCV
                ? 'Tu CV está listo. Genera tu perfil para ver tus scores.'
                : 'Primero sube tu CV en Mis fuentes.'}
            </p>
            <div className="flex justify-center mt-2">
              <GenerateProfileButton hasCV={hasCV} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const overall = Math.round(ai.overall_score)
  const overallColor = scoreColor(ai.overall_score)
  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference * (1 - ai.overall_score / 100)

  const dimensions = [
    { label: 'Profundidad técnica', value: ai.technical_depth_score },
    { label: 'Experiencia', value: ai.experience_score },
    { label: 'Certificaciones', value: ai.certification_score },
    { label: 'Evidencia práctica', value: ai.practical_evidence_score },
    { label: 'Comunidad', value: ai.community_score },
  ]

  const strengths = toStringArray(ai.strengths)
  const growthAreas = toStringArray(ai.growth_areas)
  const tags = ai.specialization_tags ?? []
  const generatedAt = new Date(ai.generated_at).toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Mi score</h1>
          <p className="mt-1 text-sm text-surface-400">
            Análisis generado el {generatedAt}
            {ai.model_version && (
              <span className="ml-2 text-surface-600">· {ai.model_version}</span>
            )}
          </p>
        </div>
        <GenerateProfileButton hasCV={hasCV} />
      </div>

      {/* Overall score + dimensions */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Overall ring */}
        <Card className="lg:col-span-2 flex flex-col items-center justify-center py-8 gap-4">
          <div className="relative h-36 w-36">
            <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#1e293b" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                strokeWidth="10"
                stroke={overallColor}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold tabular-nums" style={{ color: overallColor }}>
                {overall}
              </span>
              <span className="text-xs text-surface-500">/ 100</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-surface-200">Score general</p>
            {ai.seniority_estimate && (
              <Badge variant={seniorityVariant(ai.seniority_estimate)}>
                {seniorityLabel(ai.seniority_estimate)}
              </Badge>
            )}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 px-4">
              {tags.map(tag => (
                <Badge key={tag} variant="default">{tag}</Badge>
              ))}
            </div>
          )}
        </Card>

        {/* Dimension bars */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Breakdown por dimensión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dimensions.map(({ label, value }) => (
              <ScoreBar key={label} label={label} value={value} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Strengths + growth areas */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-success">
              <CheckCircle2 className="h-4 w-4" />
              Fortalezas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strengths.length === 0 ? (
              <p className="text-sm text-surface-500">No hay fortalezas registradas.</p>
            ) : (
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-warning">
              <AlertTriangle className="h-4 w-4" />
              Áreas de mejora
            </CardTitle>
          </CardHeader>
          <CardContent>
            {growthAreas.length === 0 ? (
              <p className="text-sm text-surface-500">No hay áreas de mejora registradas.</p>
            ) : (
              <ul className="space-y-2">
                {growthAreas.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {g}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Narrative summary */}
      {ai.narrative_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCw className="h-4 w-4 text-brand-400" />
              Resumen narrativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-surface-300 leading-relaxed">{ai.narrative_summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
