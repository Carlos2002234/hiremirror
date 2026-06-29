import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/anthropic'
import { PROFILER_SYSTEM, buildProfilerUserMessage } from '@/lib/ai/prompts/profiler'
import { NextResponse } from 'next/server'
import type { Database, Json } from '@/types/supabase'

export const maxDuration = 120

type AiProfileInsert = Database['public']['Tables']['ai_profiles']['Insert']
type EvidenceSourceRow = Database['public']['Tables']['evidence_sources']['Row']

const MODEL = 'claude-opus-4-8'

export async function POST() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada en el servidor', detail: 'Missing env var' }, { status: 500 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Get candidate profile
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id, full_name, headline, years_experience, primary_specialization')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
  }

  const candidateId = (profile as { id: string; full_name: string | null; headline: string | null; years_experience: number | null; primary_specialization: string | null }).id

  // Get CV source path
  const { data: cvSourceRaw } = await supabase
    .from('evidence_sources')
    .select('url')
    .eq('candidate_id', candidateId)
    .eq('source_type', 'cv')
    .single()

  const cvSource = cvSourceRaw as Pick<EvidenceSourceRow, 'url'> | null

  if (!cvSource?.url) {
    return NextResponse.json({ error: 'No se encontró CV. Sube tu CV primero.' }, { status: 400 })
  }

  const isDocx = cvSource.url.endsWith('.docx') || cvSource.url.endsWith('.doc')
  if (isDocx) {
    return NextResponse.json(
      { error: 'Tu CV está en formato DOCX. Elimínalo en "Mis fuentes" y sube un PDF.' },
      { status: 400 },
    )
  }

  // Download CV from Supabase Storage
  const { data: blob, error: downloadError } = await supabase.storage
    .from('cv-uploads')
    .download(cvSource.url)

  if (downloadError || !blob) {
    return NextResponse.json({ error: 'Error al descargar el CV' }, { status: 500 })
  }

  const arrayBuffer = await blob.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')

  // Call Claude with the CV as a document block
  const anthropic = getAnthropicClient()

  const typedProfile = profile as {
    id: string
    full_name: string | null
    headline: string | null
    years_experience: number | null
    primary_specialization: string | null
  }

  let rawText: string
  try {
    const stream = await anthropic.messages.stream({
      model: MODEL,
      max_tokens: 2048,
      thinking: { type: 'adaptive' },
      system: PROFILER_SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64,
              },
            },
            {
              type: 'text',
              text: buildProfilerUserMessage({
                fullName: typedProfile.full_name ?? 'Unknown',
                headline: typedProfile.headline,
                yearsOfExperience: typedProfile.years_experience,
                specialization: typedProfile.primary_specialization,
              }),
            },
          ],
        },
      ],
    })

    const message = await stream.finalMessage()
    const textBlock = message.content.find(b => b.type === 'text')
    rawText = textBlock && 'text' in textBlock ? textBlock.text : ''
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Claude API error:', msg)
    return NextResponse.json({ error: 'Error al llamar a la IA. Intenta de nuevo.', detail: msg }, { status: 502 })
  }

  // Parse JSON response
  let parsed: Record<string, unknown>
  try {
    // Strip any accidental markdown fences
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('Failed to parse Claude response:', rawText)
    return NextResponse.json({ error: 'La IA devolvió una respuesta inválida. Intenta de nuevo.' }, { status: 500 })
  }

  // Build upsert payload
  const aiPayload: AiProfileInsert = {
    candidate_id: candidateId,
    narrative_summary: (parsed.narrative_summary as string) ?? null,
    technical_depth_score: Number(parsed.technical_depth_score ?? 0),
    experience_score: Number(parsed.experience_score ?? 0),
    certification_score: Number(parsed.certification_score ?? 0),
    practical_evidence_score: Number(parsed.practical_evidence_score ?? 0),
    community_score: Number(parsed.community_score ?? 0),
    overall_score: Number(parsed.overall_score ?? 0),
    strengths: (parsed.strengths ?? null) as Json | null,
    growth_areas: (parsed.growth_areas ?? null) as Json | null,
    specialization_tags: Array.isArray(parsed.specialization_tags)
      ? (parsed.specialization_tags as string[])
      : null,
    seniority_estimate: (parsed.seniority_estimate as AiProfileInsert['seniority_estimate']) ?? null,
    generated_at: new Date().toISOString(),
    model_version: MODEL,
  }

  const { data: saved, error: upsertError } = await supabase
    .from('ai_profiles')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert(aiPayload as any, { onConflict: 'candidate_id' })
    .select()
    .single()

  if (upsertError) {
    console.error('Supabase upsert error:', upsertError)
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  // Mark CV source as ready
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('evidence_sources') as any)
    .update({ status: 'ready' })
    .eq('candidate_id', candidateId)
    .eq('source_type', 'cv')

  return NextResponse.json({ aiProfile: saved })
}
