import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/anthropic'
import { LINKEDIN_OPTIMIZER_SYSTEM, buildLinkedInOptimizerMessage } from '@/lib/ai/prompts/linkedin-optimizer'
import { NextResponse } from 'next/server'

export const maxDuration = 90

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  let body: { profileText?: string; targetRole?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const profileText = typeof body.profileText === 'string' ? body.profileText.trim() : ''
  if (profileText.length < 100) {
    return NextResponse.json({ error: 'El perfil de LinkedIn es demasiado corto. Pega más contenido.' }, { status: 400 })
  }

  // Get candidate context for tailored recommendations
  const { data: profileRaw } = await supabase
    .from('candidate_profiles')
    .select('primary_specialization, years_experience')
    .eq('user_id', user.id)
    .single()

  const profile = profileRaw as { primary_specialization: string | null; years_experience: number | null } | null

  const anthropic = getAnthropicClient()

  let rawText: string
  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: 3000,
      thinking: { type: 'adaptive' },
      system: LINKEDIN_OPTIMIZER_SYSTEM,
      messages: [
        {
          role: 'user',
          content: buildLinkedInOptimizerMessage({
            profileText,
            specialization: profile?.primary_specialization ?? null,
            targetRole: typeof body.targetRole === 'string' ? body.targetRole.trim() : null,
            yearsExperience: profile?.years_experience ?? null,
          }),
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

  let analysis: Record<string, unknown>
  try {
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    analysis = JSON.parse(cleaned)
  } catch {
    console.error('Failed to parse Claude response:', rawText)
    return NextResponse.json({ error: 'La IA devolvió una respuesta inválida. Intenta de nuevo.' }, { status: 500 })
  }

  return NextResponse.json({ analysis })
}
