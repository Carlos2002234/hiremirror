import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Briefcase, Users, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { Database } from '@/types/supabase'

export const metadata = { title: 'Dashboard empresa · HireMirror' }

type Company = Database['public']['Tables']['companies']['Row']
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

export default async function CompanyDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: companyRaw } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_user_id', user.id)
    .single()

  const company = companyRaw as Company | null

  if (!company) redirect('/onboarding/recruiter')

  const { data: jobsRaw } = await supabase
    .from('job_postings')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  const jobs: JobPosting[] = (jobsRaw ?? []) as JobPosting[]

  const totalJobs = jobs.length
  const activeJobs = jobs.filter(j => j.status === 'active').length
  const draftJobs = jobs.filter(j => j.status === 'draft').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">{company.name}</h1>
          <p className="mt-1 text-sm text-surface-400">
            {company.industry ?? 'Ciberseguridad'}
            {company.size && ` · ${company.size}`}
          </p>
        </div>
        <Link href="/company/jobs/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva vacante
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <div className="text-3xl font-bold text-surface-50">{totalJobs}</div>
          <div className="mt-1 text-xs text-surface-400 flex items-center justify-center gap-1">
            <Briefcase className="h-3 w-3" />
            Vacantes totales
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-score-high">{activeJobs}</div>
          <div className="mt-1 text-xs text-surface-400 flex items-center justify-center gap-1">
            <Eye className="h-3 w-3" />
            Publicadas
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-surface-400">{draftJobs}</div>
          <div className="mt-1 text-xs text-surface-400 flex items-center justify-center gap-1">
            <Users className="h-3 w-3" />
            Borradores
          </div>
        </Card>
      </div>

      {/* Recent jobs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Vacantes recientes</CardTitle>
            <CardDescription>Administra tus publicaciones</CardDescription>
          </div>
          <Link href="/company/jobs">
            <Button variant="ghost" size="sm" className="text-brand-400 hover:text-brand-300">
              Ver todas
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <Briefcase className="mx-auto h-8 w-8 text-surface-600" />
              <p className="text-sm text-surface-500">Aún no tienes vacantes publicadas.</p>
              <Link href="/company/jobs/new">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                  Crear primera vacante
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-surface-800">
              {jobs.slice(0, 5).map(job => {
                const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.draft
                return (
                  <div
                    key={job.id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-surface-100 truncate">{job.title}</p>
                      <p className="text-xs text-surface-500">
                        {WORK_TYPE_LABEL[job.work_type] ?? job.work_type}
                        {job.location && ` · ${job.location}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      <Link href={`/company/jobs`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          Ver
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
