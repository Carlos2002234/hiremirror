import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Shield, Plus, Search, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { GenerateProfileButton } from '@/components/candidate/GenerateProfileButton'
import type { Database } from '@/types/supabase'

export const metadata = { title: 'Dashboard' }

type AiProfile = Database['public']['Tables']['ai_profiles']['Row']
type EvidenceSource = Database['public']['Tables']['evidence_sources']['Row']

export default async function CandidateDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  type ProfileRow = Database['public']['Tables']['candidate_profiles']['Row']

  const profileResult = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
  const profile = profileResult.data as ProfileRow | null

  // First-time users haven't completed onboarding yet
  if (!profile?.full_name) redirect('/onboarding/candidate')

  const aiProfileResult = profile
    ? await supabase.from('ai_profiles').select('*').eq('candidate_id', profile.id).single()
    : { data: null }
  const aiProfile = aiProfileResult.data as AiProfile | null

  const sourcesResult = profile
    ? await supabase.from('evidence_sources').select('*').eq('candidate_id', profile.id)
    : { data: [] }

  const sources: EvidenceSource[] = (sourcesResult.data ?? []) as EvidenceSource[]
  const connectedSources = sources.filter(s => s.status === 'ready').length
  const ai = aiProfile
  const hasCV = sources.some(s => s.source_type === 'cv')

  const SCORES = ai
    ? [
        { label: 'Score General', value: ai.overall_score },
        { label: 'Técnico', value: ai.technical_depth_score },
        { label: 'Experiencia', value: ai.experience_score },
        { label: 'Certificaciones', value: ai.certification_score },
        { label: 'Evidencia Práctica', value: ai.practical_evidence_score },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">
            {profile?.full_name
              ? `Hola, ${profile.full_name.split(' ')[0]}`
              : 'Bienvenido a HireMirror'}
          </h1>
          <p className="mt-1 text-sm text-surface-400">
            {profile?.headline ?? 'Completa tu perfil para empezar'}
          </p>
        </div>
        <Link href="/analyze">
          <Button size="sm" className="gap-2">
            <Search className="h-4 w-4" />
            Analizar vacante
          </Button>
        </Link>
      </div>

      {/* Score cards */}
      {ai ? (
        <div className="space-y-3">
          <Link href="/scores">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 hover:opacity-90 transition-opacity cursor-pointer">
              {SCORES.map(({ label, value }) => (
                <Card key={label} className="text-center">
                  <div
                    className={`text-3xl font-bold ${
                      value >= 70
                        ? 'text-score-high'
                        : value >= 45
                        ? 'text-score-mid'
                        : 'text-score-low'
                    }`}
                  >
                    {Math.round(value)}
                  </div>
                  <div className="mt-1 text-xs text-surface-400">{label}</div>
                </Card>
              ))}
            </div>
          </Link>
          <p className="text-xs text-surface-500 text-right">
            <Link href="/scores" className="text-brand-400 hover:text-brand-300 underline underline-offset-2">
              Ver breakdown completo →
            </Link>
          </p>
        </div>
      ) : (
        <Card className="border-dashed border-surface-600 bg-transparent text-center">
          <CardContent className="py-10 space-y-4">
            <Shield className="mx-auto h-10 w-10 text-surface-600" />
            <p className="font-medium text-surface-300">Tu perfil de IA aún no está generado</p>
            {hasCV ? (
              <>
                <p className="text-sm text-surface-500">
                  Tu CV está listo. Genera tu perfil de IA ahora.
                </p>
                <div className="flex justify-center mt-2">
                  <GenerateProfileButton hasCV={hasCV} />
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-surface-500">
                  Sube tu CV para que la IA analice tu perfil de ciberseguridad.
                </p>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <Link href="/sources">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                      Subir CV
                    </Button>
                  </Link>
                  <GenerateProfileButton hasCV={false} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sources + Next steps */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fuentes conectadas</CardTitle>
            <CardDescription>
              {connectedSources} de {sources.length} fuentes activas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sources.length === 0 ? (
              <p className="text-sm text-surface-500">
                Conecta GitHub, HTB, TryHackMe y más para que la IA evalúe tu evidencia técnica real.
              </p>
            ) : (
              <div className="space-y-2">
                {sources.slice(0, 5).map(source => (
                  <div key={source.id} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-surface-300">
                      {source.source_type.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        source.status === 'ready'
                          ? 'text-success'
                          : source.status === 'processing'
                          ? 'text-warning'
                          : source.status === 'error'
                          ? 'text-danger'
                          : 'text-surface-500'
                      }`}
                    >
                      {source.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link href="/sources" className="mt-4 inline-block">
              <Button variant="ghost" size="sm" className="text-brand-400 hover:text-brand-300 px-0">
                <Plus className="h-4 w-4" />
                Agregar fuente
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Próximos pasos</CardTitle>
            <CardDescription>Para maximizar tu score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { done: !!profile?.full_name, label: 'Completar perfil básico' },
              { done: connectedSources >= 1, label: 'Conectar primera fuente de evidencia' },
              { done: connectedSources >= 3, label: 'Conectar 3+ fuentes' },
              { done: !!ai, label: 'Generar perfil de IA' },
            ].map(({ done, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <div
                  className={`h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                    done ? 'bg-success' : 'bg-surface-700'
                  }`}
                >
                  {done && (
                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={done ? 'text-surface-500 line-through' : 'text-surface-300'}>
                  {label}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {ai && ai.narrative_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-brand-400" />
              Resumen de tu perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-surface-300 leading-relaxed line-clamp-3">
              {ai.narrative_summary}
            </p>
            <Link href="/scores" className="text-xs text-brand-400 hover:text-brand-300 underline underline-offset-2">
              Ver fortalezas, áreas de mejora y detalles →
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
