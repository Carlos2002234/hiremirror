import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/anthropic'
import { LINKEDIN_OPTIMIZER_SYSTEM, buildLinkedInOptimizerMessage, formatProxycurlProfile } from '@/lib/ai/prompts/linkedin-optimizer'
import { NextResponse } from 'next/server'

export const maxDuration = 90

async function fetchLinkedInProfile(url: string): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  const apiKey = process.env.PROXYCURL_API_KEY
  if (!apiKey) {
    return { data: null, error: 'PROXYCURL_NOT_CONFIGURED' }
  }

  const endpoint = `https://nubela.co/proxycurl/api/v2/linkedin?url=${encodeURIComponent(url)}&use_cache=if-present`

  const res = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  if (res.status === 404) return { data: null, error: 'Perfil de LinkedIn no encontrado. Verifica que la URL sea pública.' }
  if (res.status === 402) return { data: null, error: 'Sin créditos en Proxycurl. Recarga tu cuenta.' }
  if (!res.ok) return { data: null, error: `Error al obtener el perfil (${res.status})` }

  const data = await res.json() as Record<string, unknown>
  return { data, error: null }
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  let body: { linkedinUrl?: string; profileText?: string; targetRole?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const linkedinUrl = typeof body.linkedinUrl === 'string' ? body.linkedinUrl.trim() : ''
  const profileText = typeof body.profileText === 'string' ? body.profileText.trim() : ''
  const targetRole = typeof body.targetRole === 'string' ? body.targetRole.trim() : ''

  // Determine input mode
  let finalProfileText = ''
  let scraped = false

  if (linkedinUrl && linkedinUrl.includes('linkedin.com/in/')) {
    const { data, error } = await fetchLinkedInProfile(linkedinUrl)

    if (error === 'PROXYCURL_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'PROXYCURL_NOT_CONFIGURED' }, { status: 422 })
    }
    if (error || !data) {
      return NextResponse.json({ error: error ?? 'Error al obtener el perfil' }, { status: 502 })
    }

    finalProfileText = formatProxycurlProfile(data)
    scraped = true
  } else if (profileText.length >= 100) {
    finalProfileText = profileText
  } else {
    return NextResponse.json({ error: 'Proporciona una URL de LinkedIn válida o pega el texto de tu perfil.' }, { status: 400 })
  }

  // Get candidate context
  const { data: profileRaw } = await supabase
    .from('candidate_profiles')
    .select('primary_specialization, years_experience')
    .eq('user_id', user.id)
    .single()

  const candidateProfile = profileRaw as { primary_specialization: string | null; years_experience: number | null } | null

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
            profileText: finalProfileText,
            specialization: candidateProfile?.primary_specialization ?? null,
            targetRole: targetRole || null,
            yearsExperience: candidateProfile?.years_experience ?? null,
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

  return NextResponse.json({ analysis, scraped })
}
