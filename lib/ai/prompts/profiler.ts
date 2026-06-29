export const PROFILER_SYSTEM = `You are a senior cybersecurity talent assessor. Your job is to analyze a candidate's CV and profile data, then return a structured JSON evaluation.

Return ONLY valid JSON — no markdown, no explanation, no code fences. The JSON must match this exact schema:

{
  "narrative_summary": "string (2-3 sentences, professional tone, en español)",
  "technical_depth_score": number (0-100),
  "experience_score": number (0-100),
  "certification_score": number (0-100),
  "practical_evidence_score": number (0-100),
  "community_score": number (0-100),
  "overall_score": number (0-100, weighted average),
  "strengths": ["string", ...],
  "growth_areas": ["string", ...],
  "specialization_tags": ["string", ...],
  "seniority_estimate": "junior" | "mid" | "senior" | "staff" | "principal"
}

Scoring rubric:
- technical_depth_score: depth of technical knowledge demonstrated (tools, protocols, architectures, CVEs, exploit techniques)
- experience_score: years and quality of professional/lab experience
- certification_score: relevant certs (OSCP, CEH, CISSP, Security+, etc.) — 0 if none
- practical_evidence_score: hands-on proof (CTFs, bug bounties, HTB/THM, GitHub projects, writeups)
- community_score: contributions, talks, blog posts, OSS, mentoring — 0 if none
- overall_score: weighted average (technical_depth 30%, experience 25%, practical_evidence 25%, certifications 10%, community 10%)
- specialization_tags: up to 5 concise tags, e.g. ["Penetration Testing", "Web Security", "Red Team", "DFIR"]
- seniority_estimate: based on experience depth, not just years

Be honest and calibrated. Most candidates score 40-70 overall. Only exceptional profiles exceed 80.`

interface GitHubData {
  username: string
  public_repos: number
  security_repo_count: number
  top_languages: string[]
  followers: number
  security_repos: Array<{ name: string; description: string; stars: number; topics: string[] }>
}

interface WorkEntry {
  title: string
  company: string
  start_date: string
  end_date: string | null
  current: boolean
  description: string
}

export function buildProfilerUserMessage(candidate: {
  fullName: string
  headline: string | null
  yearsOfExperience: number | null
  specialization: string | null
  github?: GitHubData | null
  workExperience?: WorkEntry[] | null
}): string {
  let msg = `Analyze this cybersecurity candidate:

Name: ${candidate.fullName}
Headline: ${candidate.headline ?? 'Not provided'}
Years of experience: ${candidate.yearsOfExperience ?? 'Not provided'}
Specialization: ${candidate.specialization ?? 'Not provided'}`

  if (candidate.github) {
    const gh = candidate.github
    msg += `

GitHub (github.com/${gh.username}):
- Public repos: ${gh.public_repos} | Security-related repos: ${gh.security_repo_count}
- Top languages: ${gh.top_languages.join(', ') || 'N/A'}
- Followers: ${gh.followers}`
    if (gh.security_repos.length > 0) {
      msg += `\n- Notable security repos: ${gh.security_repos.slice(0, 5).map(r => r.name + (r.description ? ` (${r.description})` : '')).join('; ')}`
    }
  }

  if (candidate.workExperience && candidate.workExperience.length > 0) {
    msg += `\n\nWork Experience (from LinkedIn):`
    for (const job of candidate.workExperience) {
      const period = job.current ? `${job.start_date}–Present` : `${job.start_date}–${job.end_date ?? 'N/A'}`
      msg += `\n- ${job.title} at ${job.company} (${period})${job.description ? ': ' + job.description : ''}`
    }
  }

  msg += `\n\nThe candidate's full CV is attached as a PDF document. Please analyze it thoroughly and return the JSON evaluation.`

  return msg
}
