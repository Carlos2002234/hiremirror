import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Briefcase, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { Database } from '@/types/supabase'

export const metadata = { title: 'Mis vacantes · HireMirror' }

type JobPosting = Database['public']['Tables']['job_postings']['Row']

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'danger' }> = {
  active: { label: 'Activa', variant: 'success' },
  draft: { label: 'Borrador', variant: 'default' },
  paused: { label: 'Pausada', variant: 'warning' },
  closed: { label: 'Cerrada', variant: 'danger' },
}

const WORK_TYPE_LABEL: Record<string, string> = {
  remote: 'Remoto',
  hybrid: 'Híbrido',
  onsite: 'Presencial',
}

const EMPLOYMENT_LABEL: Record<string, string> = {
  full_time: 'Tiempo completo',
  part_time: 'Medio tiempo',
  contract: 'Contrato',
  consulting: 'Consultoría',
}

export default async function CompanyJobsPage() {
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

  const { data: jobsRaw } = await supabase
    .from('job_postings')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  const jobs: JobPosting[] = (jobsRaw ?? []) as JobPosting[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Vacantes</h1>
          <p className="mt-1 text-sm text-surface-400">
            {jobs.length} {jobs.length === 1 ? 'vacante' : 'vacantes'} en total
          </p>
        </div>
        <Link href="/company/jobs/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva vacante
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <Card className="border-dashed border-surface-600 bg-transparent text-center">
          <CardContent className="py-16 space-y-3">
            <Briefcase className="mx-auto h-12 w-12 text-surface-600" />
            <p className="font-medium text-surface-300">Aún no tienes vacantes</p>
            <p className="text-sm text-surface-500">
              Crea tu primera vacante para empezar a recibir candidatos.
            </p>
            <Link href="/company/jobs/new" className="inline-block mt-2">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4" />
                Crear primera vacante
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => {
            const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.draft
            const date = new Date(job.created_at).toLocaleDateString('es-CR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })

            return (
              <Card key={job.id}>
                <CardContent className="flex items-start justify-between gap-4 py-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/company/jobs/${job.id}`} className="hover:text-brand-400 transition-colors">
                        <h3 className="font-medium text-surface-100">{job.title}</h3>
                      </Link>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </div>
                    <p className="text-xs text-surface-500">
                      {WORK_TYPE_LABEL[job.work_type] ?? job.work_type}
                      {' · '}
                      {EMPLOYMENT_LABEL[job.employment_type] ?? job.employment_type}
                      {job.location && ` · ${job.location}`}
                    </p>
                    {(job.salary_min || job.salary_max) && (
                      <p className="text-xs text-surface-400">
                        {job.salary_min && job.salary_max
                          ? `$${job.salary_min.toLocaleString()} – $${job.salary_max.toLocaleString()} ${job.currency}`
                          : job.salary_min
                          ? `Desde $${job.salary_min.toLocaleString()} ${job.currency}`
                          : `Hasta $${job.salary_max?.toLocaleString()} ${job.currency}`}
                      </p>
                    )}
                    <p className="text-xs text-surface-600">Creada el {date}</p>
                  </div>
                  <div className="shrink-0">
                    <Link href={`/company/jobs/${job.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Ver candidatos
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
