import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/anthropic'
import { INTERVIEW_SYSTEM, buildInterviewUserMessage } from '@/lib/ai/prompts/interview'
import { NextResponse } from 'next/server'
import type { Database, Json } from '@/types/supabase'

type JobPosting = Database['public']['Tables']['job_postings']['Row']
type AiProfile = Database['public']['Tables']['ai_profiles']['Row']
type CandidateProfile = Database['public']['Tables']['candidate_profiles']['Row']
type IQInsert = Database['public']['Tables']['interview_questions']['Insert']

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

  // Verify user owns a company
  const { data: companyRaw } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_user_id', user.id)
    .single()

  const company = companyRaw as { id: string } | null
  if (!company) {
    return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 403 })
  }

  let jobId: string, candidateId: string
  try {
    const body = await request.json()
    jobId = String(body.jobId ?? '')
    candidateId = String(body.candidateId ?? '')
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  if (!jobId || !candidateId) {
    return NextResponse.json({ error: 'jobId y candidateId son requeridos' }, { status: 400 })
  }

  // Verify job belongs to this company
  const { data: jobRaw } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', jobId)
    .eq('company_id', company.id)
    .single()

  const job = jobRaw as JobPosting | null
  if (!job) {
    return NextResponse.json({ error: 'Vacante no encontrada' }, { status: 404 })
  }

  // Get candidate AI profile
  const { data: aiRaw } = await supabase
    .from('ai_profiles')
    .select('*')
    .eq('candidate_id', candidateId)
    .single()

  const ai = aiRaw as AiProfile | null
  if (!ai) {
    return NextResponse.json({ error: 'El candidato no tiene perfil de IA' }, { status: 404 })
  }

  // Get candidate profile
  const { data: cpRaw } = await supabase
    .from('candidate_profiles')
    .select('full_name, headline')
    .eq('id', candidateId)
    .single()

  const cp = cpRaw as Pick<CandidateProfile, 'full_name' | 'headline'> | null

  const anthropic = getAnthropicClient()

  let rawText: string
  try {
    const stream = await anthropic.messages.stream({
      model: MODEL,
      max_tokens: 3000,
      thinking: { type: 'adaptive' },
      system: INTERVIEW_SYSTEM,
      messages: [
        {
          role: 'user',
          content: buildInterviewUserMessage(
            {
              title: job.title,
              description: job.description,
              requirementsRaw: job.requirements_raw,
            },
            {
              fullName: cp?.full_name ?? 'Candidato',
              headline: cp?.headline ?? null,
              seniority: ai.seniority_estimate,
              overallScore: ai.overall_score,
              technicalScore: ai.technical_depth_score,
              certificationScore: ai.certification_score,
              practicalScore: ai.practical_evidence_score,
              specializations: toStringArray(ai.specialization_tags),
              strengths: toStringArray(ai.strengths),
              growthAreas: toStringArray(ai.growth_areas),
              narrative: ai.narrative_summary,
            },
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

  let parsed: { questions: unknown[] }
  try {
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('Failed to parse Claude response:', rawText)
    return NextResponse.json({ error: 'La IA devolvió una respuesta inválida.' }, { status: 500 })
  }

  // Save to interview_questions table (upsert)
  const iqPayload: IQInsert = {
    job_posting_id: jobId,
    candidate_id: candidateId,
    questions: parsed.questions as Json,
    generated_at: new Date().toISOString(),
  }

  const { data: saved, error: saveError } = await supabase
    .from('interview_questions')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert(iqPayload as any, { onConflict: 'job_posting_id,candidate_id' })
    .select()
    .single()

  if (saveError) {
    console.error('Supabase save error:', saveError)
    // Return questions even if save fails
    return NextResponse.json({ questions: parsed.questions })
  }

  const savedRow = saved as { questions: unknown }
  return NextResponse.json({ questions: savedRow.questions })
}
