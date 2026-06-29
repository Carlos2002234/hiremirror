import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface WorkEntry {
  company: string
  title: string
  start_date: string
  end_date: string
  current: boolean
  description: string
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  let body: { url?: string; work_experience?: WorkEntry[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const url = typeof body.url === 'string' ? body.url.trim() : ''
  const work_experience: WorkEntry[] = Array.isArray(body.work_experience) ? body.work_experience : []

  if (!url.includes('linkedin.com')) {
    return NextResponse.json({ error: 'URL de LinkedIn inválida' }, { status: 400 })
  }

  const candidateId = (profile as { id: string }).id

  const { data: source, error } = await supabase
    .from('evidence_sources')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert({
      candidate_id: candidateId,
      source_type: 'linkedin',
      url,
      processed_data: { linkedin_url: url, work_experience },
      status: 'ready',
      last_synced_at: new Date().toISOString(),
    } as any, { onConflict: 'candidate_id,source_type' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ source })
}
