import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/anthropic'
import { ROADMAP_SYSTEM, buildRoadmapUserMessage } from '@/lib/ai/prompts/roadmap'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

type AiProfile = Database['public']['Tables']['ai_profiles']['Row']

const MODEL = 'claude-opus-4-8'

function toStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string')
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data: profileRaw } = await supabase
    .from('candidate_profiles')
    .select('id, years_experience, primary_specialization')
    .eq('user_id', user.id)
    .single()

  const profile = profileRaw as {
    id: string
    years_experience: number | null
    primary_specialization: string | null
  } | null

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
  }

  const { data: aiRaw } = await supabase
    .from('ai_profiles')
    .select('*')
    .eq('candidate_id', profile.id)
    .single()

  const ai = aiRaw as AiProfile | null

  if (!ai) {
    return NextResponse.json(
      { error: 'Primero genera tu perfil de IA en el Dashboard.' },
      { status: 400 },
    )
  }

  const anthropic = getAnthropicClient()

  let rawText: string
  try {
    const stream = await anthropic.messages.stream({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system: ROADMAP_SYSTEM,
      messages: [
        {
          role: 'user',
          content: buildRoadmapUserMessage({
            overallScore: ai.overall_score,
            technicalScore: ai.technical_depth_score,
            experienceScore: ai.experience_score,
            certificationScore: ai.certification_score,
            practicalScore: ai.practical_evidence_score,
            communityScore: ai.community_score,
            seniority: ai.seniority_estimate,
            specializations: toStringArray(ai.specialization_tags),
            strengths: toStringArray(ai.strengths),
            growthAreas: toStringArray(ai.growth_areas),
            narrative: ai.narrative_summary,
            yearsExperience: profile.years_experience,
            primarySpecialization: profile.primary_specialization,
          }),
        },
      ],
    })

    const message = await stream.finalMessage()
    const textBlock = message.content.find(b => b.type === 'text')
    rawText = textBlock && 'text' in textBlock ? textBlock.text : ''
  } catch (err) {
    console.error('Claude API error:', err)
    return NextResponse.json({ error: 'Error al llamar a la IA. Intenta de nuevo.' }, { status: 502 })
  }

  let roadmap: Record<string, unknown>
  try {
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    roadmap = JSON.parse(cleaned)
  } catch {
    console.error('Failed to parse Claude response:', rawText)
    return NextResponse.json(
      { error: 'La IA devolvió una respuesta inválida. Intenta de nuevo.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ roadmap, generatedAt: new Date().toISOString() })
}
