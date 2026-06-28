import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/anthropic'
import { JOB_ANALYZER_SYSTEM, buildJobAnalyzerUserMessage } from '@/lib/ai/prompts/job-analyzer'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

type AiProfile = Database['public']['Tables']['ai_profiles']['Row']

const MODEL = 'claude-opus-4-8'

function toStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string')
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let jobText: string
  try {
    const body = await request.json()
    jobText = typeof body.jobText === 'string' ? body.jobText.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido' }, { status: 400 })
  }

  if (jobText.length < 50) {
    return NextResponse.json({ error: 'El texto de la vacante es demasiado corto' }, { status: 400 })
  }

  // Get candidate profile
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

  // Get AI profile (required for match)
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
      max_tokens: 2048,
      thinking: { type: 'adaptive' },
      system: JOB_ANALYZER_SYSTEM,
      messages: [
        {
          role: 'user',
          content: buildJobAnalyzerUserMessage(
            {
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
              yearsOfExperience: profile.years_experience,
              specialization: profile.primary_specialization,
            },
            jobText,
          ),
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

  let result: Record<string, unknown>
  try {
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    result = JSON.parse(cleaned)
  } catch {
    console.error('Failed to parse Claude response:', rawText)
    return NextResponse.json(
      { error: 'La IA devolvió una respuesta inválida. Intenta de nuevo.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ match: result })
}
