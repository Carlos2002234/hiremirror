import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

type JobInsert = Database['public']['Tables']['job_postings']['Insert']

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Get company for this user
  const { data: companyRaw } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_user_id', user.id)
    .single()

  const company = companyRaw as { id: string } | null
  if (!company) {
    return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''

  if (!title || !description) {
    return NextResponse.json({ error: 'Título y descripción son requeridos' }, { status: 400 })
  }

  const payload: JobInsert = {
    company_id: company.id,
    created_by: user.id,
    title,
    description,
    requirements_raw: typeof body.requirements_raw === 'string'
      ? body.requirements_raw.trim() || null
      : null,
    work_type: (body.work_type as JobInsert['work_type']) ?? 'remote',
    employment_type: (body.employment_type as JobInsert['employment_type']) ?? 'full_time',
    location: typeof body.location === 'string' ? body.location.trim() || null : null,
    salary_min: typeof body.salary_min === 'number' ? body.salary_min : null,
    salary_max: typeof body.salary_max === 'number' ? body.salary_max : null,
    currency: typeof body.currency === 'string' ? body.currency : 'USD',
    status: (body.status as JobInsert['status']) ?? 'draft',
  }

  const { data: job, error } = await supabase
    .from('job_postings')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(payload as any)
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ jobId: (job as { id: string }).id })
}
