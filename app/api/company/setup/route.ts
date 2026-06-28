import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

type CompanyInsert = Database['public']['Tables']['companies']['Insert']

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
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) {
    return NextResponse.json({ error: 'El nombre de la empresa es requerido' }, { status: 400 })
  }

  // Check if company already exists for this user
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_user_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ companyId: (existing as { id: string }).id })
  }

  // Update user role to recruiter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('users') as any)
    .update({ role: 'recruiter' })
    .eq('id', user.id)

  // Create company record
  const payload: CompanyInsert = {
    owner_user_id: user.id,
    name,
    size: (body.size as CompanyInsert['size']) ?? null,
    industry: typeof body.industry === 'string' ? body.industry.trim() || null : null,
    website: typeof body.website === 'string' ? body.website.trim() || null : null,
    plan: 'free',
    is_verified: false,
  }

  const { data: company, error } = await supabase
    .from('companies')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(payload as any)
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ companyId: (company as { id: string }).id })
}
