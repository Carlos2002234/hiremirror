import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

type ProfileInsert = Database['public']['Tables']['candidate_profiles']['Insert']

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const allowed: (keyof ProfileInsert)[] = [
    'full_name', 'headline', 'bio', 'location',
    'years_experience', 'primary_specialization', 'secondary_specializations',
    'work_preference', 'is_open_to_work',
    'desired_salary_min', 'desired_salary_max', 'currency',
  ]

  const payload: ProfileInsert = { user_id: user.id, updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) (payload as Record<string, unknown>)[key] = body[key]
  }

  const { data, error } = await supabase
    .from('candidate_profiles')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert(payload as any, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}
