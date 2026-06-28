import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, MapPin, Briefcase } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { InterviewQuestionsPanel } from '@/components/company/InterviewQuestionsPanel'
import type { Database } from '@/types/supabase'

type JobPosting = Database['public']['Tables']['job_postings']['Row']
type AiProfile = Database['public']['Tables']['ai_profiles']['Row']
type CandidateProfile = Database['public']['Tables']['candidate_profiles']['Row']
type InterviewQuestion = Database['public']['Tables']['interview_questions']['Row']

function scoreColor(v: number) {
  if (v >= 70) return 'text-score-high'
  if (v >= 45) return 'text-score-mid'
  return 'text-score-low'
}

function toStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string')
}

const WORK_TYPE_LABEL: Record<string, string> = {
  remote: 'Remoto',
  hybrid: 'Híbrido',
  onsite: 'Presencial',
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'danger' }> = {
  active: { label: 'Activa', variant: 'success' },
  draft: { label: 'Borrador', variant: 'default' },
  paused: { label: 'Pausada', variant: 'warning' },
  closed: { label: 'Cerrada', variant: 'danger' },
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: companyRaw } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_user_id', user.id)
    .single()

  const company = companyRaw as { id: string } | null
  if (!company) redirect('/onboarding/recruiter')

  // Get job (verify it belongs to this company)
  const { data: jobRaw } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', id)
    .eq('company_id', company.id)
    .single()

  const job = jobRaw as JobPosting | null
  if (!job) redirect('/company/jobs')

  // Get all candidates with AI profiles, ranked by overall_score
  const { data: aiProfilesRaw } = await supabase
    .from('ai_profiles')
    .select('*, candidate_profiles(*)')
    .order('overall_score', { ascending: false })
    .limit(30)

  type AiWithProfile = AiProfile & { candidate_profiles: CandidateProfile | null }
  const aiProfiles = (aiProfilesRaw ?? []) as AiWithProfile[]

  // Get existing interview questions for this job
  const { data: existingQuestionsRaw } = await supabase
    .from('interview_questions')
    .select('candidate_id, questions')
    .eq('job_posting_id', id)

  const iqMap = new Map<string, InterviewQuestion['questions']>()
  for (const iq of ((existingQuestionsRaw ?? []) as Pick<InterviewQuestion, 'candidate_id' | 'questions'>[])) {
    iqMap.set(iq.candidate_id, iq.questions)
  }

  const statusCfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.draft

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <Link
          href="/company/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-surface-400 hover:text-surface-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a vacantes
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-surface-50">{job.title}</h1>
              <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-surface-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {WORK_TYPE_LABEL[job.work_type] ?? job.work_type}
              </span>
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
              )}
              {(job.salary_min || job.salary_max) && (
                <span>
                  {job.salary_min && job.salary_max
                    ? `$${job.salary_min.toLocaleString()}–$${job.salary_max.toLocaleString()} ${job.currency}`
                    : job.salary_min
                    ? `Desde $${job.salary_min.toLocaleString()}`
                    : `Hasta $${job.salary_max?.toLocaleString()}`}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-surface-400">
            <Users className="h-4 w-4" />
            {aiProfiles.length} candidatos con perfil IA
          </div>
        </div>
      </div>

      {/* Candidates ranked */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-surface-200">
          Candidatos rankeados por score
        </h2>

        {aiProfiles.length === 0 ? (
          <Card className="border-dashed border-surface-600 bg-transparent text-center">
            <CardContent className="py-12 space-y-2">
              <Users className="mx-auto h-8 w-8 text-surface-600" />
              <p className="text-sm text-surface-500">
                Aún no hay candidatos con perfil de IA en la plataforma.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {aiProfiles.map((ai, idx) => {
              const cp = ai.candidate_profiles
              if (!cp) return null
              const tags = toStringArray(ai.specialization_tags)
              const existingQs = iqMap.get(ai.candidate_id)
              const parsedQuestions = Array.isArray(existingQs) ? existingQs as {
                category: string; question: string; rationale: string
              }[] : null

              return (
                <Card key={ai.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-4">
                      {/* Rank badge */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-700 text-sm font-bold text-surface-400">
                        {idx + 1}
                      </div>

                      {/* Candidate info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-base">
                            {cp.full_name ?? 'Sin nombre'}
                          </CardTitle>
                          {ai.seniority_estimate && (
                            <Badge variant="default">{ai.seniority_estimate}</Badge>
                          )}
                          {existingQs && (
                            <Badge variant="brand">Preguntas generadas</Badge>
                          )}
                        </div>
                        {cp.headline && (
                          <p className="text-sm text-surface-400 mt-0.5">{cp.headline}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {tags.map(tag => (
                            <Badge key={tag} variant="default">{tag}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right shrink-0">
                        <div className={`text-2xl font-bold tabular-nums ${scoreColor(ai.overall_score)}`}>
                          {Math.round(ai.overall_score)}
                        </div>
                        <div className="text-xs text-surface-500">score</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-3">
                    {/* Mini score breakdown */}
                    <div className="flex gap-4 flex-wrap">
                      {[
                        { label: 'Técnico', val: ai.technical_depth_score },
                        { label: 'Experiencia', val: ai.experience_score },
                        { label: 'Certs', val: ai.certification_score },
                        { label: 'Práctica', val: ai.practical_evidence_score },
                      ].map(({ label, val }) => (
                        <div key={label} className="text-center">
                          <div className={`text-sm font-semibold tabular-nums ${scoreColor(val)}`}>
                            {Math.round(val)}
                          </div>
                          <div className="text-xs text-surface-600">{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Interview questions panel */}
                    <div className="border-t border-surface-800 pt-3">
                      <InterviewQuestionsPanel
                        jobId={id}
                        candidateId={ai.candidate_id}
                        initialQuestions={parsedQuestions}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
