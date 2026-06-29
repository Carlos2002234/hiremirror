export const LINKEDIN_OPTIMIZER_SYSTEM = `You are an expert LinkedIn profile coach specializing in cybersecurity professionals. Your job is to analyze a LinkedIn profile and return specific, actionable improvements to maximize the candidate's personal brand and job search success in the cybersecurity industry.

Return ONLY valid JSON — no markdown, no explanation, no code fences. Match this exact schema:

{
  "overall_score": number (0-100),
  "narrative_summary": "string (2-3 sentences summary of the profile's current state, en español)",
  "headline": {
    "current": "string (the current headline, extracted from profile)",
    "score": number (0-100),
    "issues": ["string", ...],
    "improved": "string (rewritten headline, max 220 chars, keyword-rich, specific)"
  },
  "summary": {
    "score": number (0-100),
    "issues": ["string", ...],
    "improved": "string (rewritten About section, 3-5 sentences, first person, impact-focused)"
  },
  "skills": {
    "score": number (0-100),
    "missing_keywords": ["string", ...],
    "remove_suggestions": ["string", ...],
    "recommendations": ["string", ...]
  },
  "experience": {
    "score": number (0-100),
    "issues": ["string", ...],
    "tips": ["string", ...]
  },
  "personal_brand": {
    "score": number (0-100),
    "strengths": ["string", ...],
    "improvements": ["string", ...]
  },
  "quick_wins": ["string", ...],
  "ats_keywords": ["string", ...]
}

Scoring rubric:
- headline: keyword richness, specificity, value proposition clarity (not just job title)
- summary: storytelling, impact metrics, call to action, cybersecurity focus
- skills: coverage of relevant security tools/certs/domains, missing critical keywords
- experience: quantified achievements, action verbs, security impact demonstrated
- personal_brand: consistency, niche authority, differentiation from generic profiles
- quick_wins: max 5 specific changes that take < 5 minutes and have high impact
- ats_keywords: 8-12 high-value keywords missing from the profile for their target role
- overall_score: weighted average (headline 15%, summary 20%, skills 25%, experience 25%, personal_brand 15%)

Be specific and honest. Reference actual text from the profile in your issues. The improved sections should be ready to copy-paste. Write issues and recommendations in Spanish. Write improved headline and summary in the same language as the original profile.`

interface ProxycurlExperience {
  title?: string
  company?: string
  description?: string
  starts_at?: { year?: number; month?: number }
  ends_at?: { year?: number; month?: number } | null
}

interface ProxycurlEducation {
  school?: string
  degree_name?: string
  field_of_study?: string
  starts_at?: { year?: number }
  ends_at?: { year?: number }
}

interface ProxycurlCertification {
  name?: string
  authority?: string
}

export function formatProxycurlProfile(data: Record<string, unknown>): string {
  const lines: string[] = []

  const str = (v: unknown) => (typeof v === 'string' ? v : '')
  const num = (v: unknown) => (typeof v === 'number' ? v : null)

  lines.push(`Name: ${str(data.full_name) || `${str(data.first_name)} ${str(data.last_name)}`.trim()}`)
  if (data.headline) lines.push(`Headline: ${str(data.headline)}`)
  if (data.occupation) lines.push(`Current role: ${str(data.occupation)}`)
  if (data.city || data.country) lines.push(`Location: ${[str(data.city), str(data.country)].filter(Boolean).join(', ')}`)
  if (num(data.connections)) lines.push(`Connections: ${data.connections}+`)
  if (data.follower_count) lines.push(`Followers: ${data.follower_count}`)

  if (data.summary) {
    lines.push('\n--- ABOUT / SUMMARY ---')
    lines.push(str(data.summary).slice(0, 2000))
  }

  const experiences = (data.experiences as ProxycurlExperience[] | null) ?? []
  if (experiences.length) {
    lines.push('\n--- EXPERIENCE ---')
    for (const exp of experiences.slice(0, 10)) {
      const start = exp.starts_at?.year ?? '?'
      const end = exp.ends_at ? (exp.ends_at.year ?? '?') : 'Present'
      lines.push(`- ${exp.title ?? 'Unknown role'} at ${exp.company ?? 'Unknown company'} (${start}–${end})`)
      if (exp.description) lines.push(`  ${exp.description.slice(0, 400)}`)
    }
  }

  const education = (data.education as ProxycurlEducation[] | null) ?? []
  if (education.length) {
    lines.push('\n--- EDUCATION ---')
    for (const edu of education.slice(0, 5)) {
      const year = edu.ends_at?.year ?? edu.starts_at?.year ?? ''
      lines.push(`- ${edu.degree_name ?? ''} ${edu.field_of_study ? `in ${edu.field_of_study}` : ''} at ${edu.school ?? ''} ${year}`.trim())
    }
  }

  const skills = (data.skills as string[] | null) ?? []
  if (skills.length) {
    lines.push('\n--- SKILLS ---')
    lines.push(skills.slice(0, 50).join(', '))
  }

  const certs = (data.certifications as ProxycurlCertification[] | null) ?? []
  if (certs.length) {
    lines.push('\n--- CERTIFICATIONS ---')
    for (const cert of certs.slice(0, 10)) {
      lines.push(`- ${cert.name ?? ''}${cert.authority ? ` (${cert.authority})` : ''}`)
    }
  }

  if (data.volunteer_work) {
    const vw = data.volunteer_work as Array<{ role?: string; company?: { name?: string } }>
    if (vw.length) {
      lines.push('\n--- VOLUNTEER / COMMUNITY ---')
      for (const v of vw.slice(0, 5)) {
        lines.push(`- ${v.role ?? ''} at ${v.company?.name ?? ''}`)
      }
    }
  }

  return lines.join('\n')
}

export function buildLinkedInOptimizerMessage(params: {
  profileText: string
  specialization: string | null
  targetRole: string | null
  yearsExperience: number | null
}): string {
  return `Analyze this LinkedIn profile for a cybersecurity professional.

Target specialization: ${params.specialization ?? 'General cybersecurity'}
Target role: ${params.targetRole ?? 'Not specified'}
Years of experience: ${params.yearsExperience ?? 'Not specified'}

--- LINKEDIN PROFILE TEXT ---
${params.profileText.slice(0, 8000)}
--- END OF PROFILE ---

Return the JSON analysis.`
}
