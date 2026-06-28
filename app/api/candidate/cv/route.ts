import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

type EvidenceInsert = Database['public']['Tables']['evidence_sources']['Insert']

const BUCKET = 'cv-uploads'
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Get candidate profile id
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Formulario inválido' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'El archivo supera el límite de 10 MB' }, { status: 413 })
  }

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Solo se aceptan PDF o DOCX' }, { status: 415 })
  }

  // Upload to Storage: {userId}/{timestamp}_{filename}
  const ext = file.name.split('.').pop()
  const storagePath = `${user.id}/${Date.now()}_cv.${ext}`
  const arrayBuffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const profileId = (profile as { id: string }).id

  // Upsert evidence_source record (one CV per candidate)
  const evidencePayload: EvidenceInsert = {
    candidate_id: profileId,
    source_type: 'cv',
    url: storagePath,
    status: 'pending',
    last_synced_at: new Date().toISOString(),
  }

  const { data: source, error: sourceError } = await supabase
    .from('evidence_sources')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert(evidencePayload as any, { onConflict: 'candidate_id,source_type' })
    .select()
    .single()

  if (sourceError) {
    return NextResponse.json({ error: sourceError.message }, { status: 500 })
  }

  return NextResponse.json({ source })
}
