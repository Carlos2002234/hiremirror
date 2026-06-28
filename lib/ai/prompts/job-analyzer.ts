export const JOB_ANALYZER_SYSTEM = `You are a cybersecurity talent matching expert. You will receive:
1. A candidate's AI profile (scores, specializations, seniority, strengths, growth areas)
2. A raw job posting

Analyze the match and return ONLY valid JSON — no markdown, no explanation, no code fences.

Required JSON schema:
{
  "job_title": "string (extract from posting, or 'Unknown' if not found)",
  "company_name": "string (extract from posting, or 'Unknown' if not found)",
  "seniority_required": "junior" | "mid" | "senior" | "staff" | "principal",
  "compatibility_score": number (0-100, overall match),
  "technical_match": number (0-100, technical skills alignment),
  "experience_match": number (0-100, years/depth alignment),
  "certification_match": number (0-100, certs required vs held),
  "recommendation": "apply" | "borderline" | "not_ready",
  "summary": "string (2-3 sentences in Spanish explaining the match)",
  "matched_skills": ["string", ...],
  "skill_gaps": ["string", ...],
  "recommended_certs": ["string", ...],
  "recommended_labs": ["string", ...]
}

Scoring guide:
- compatibility_score ≥ 70 → "apply"
- compatibility_score 50-69 → "borderline"
- compatibility_score < 50 → "not_ready"
- matched_skills: skills/tools the candidate clearly has that the job needs (max 8)
- skill_gaps: required skills/tools the candidate is missing or weak on (max 8)
- recommended_certs: certs that would strengthen this specific application (max 4)
- recommended_labs: HTB/THM/PortSwigger labs or CTF categories to close the gaps (max 4)

Be specific and actionable. Focus on cybersecurity domain alignment.`

export function buildJobAnalyzerUserMessage(candidate: {
  overallScore: number
  technicalScore: number
  experienceScore: number
  certificationScore: number
  practicalScore: number
  communityScore: number
  seniority: string | null
  specializations: string[]
  strengths: string[]
  growthAreas: string[]
  narrative: string | null
  yearsOfExperience: number | null
  specialization: string | null
}, jobText: string): string {
  return `CANDIDATE PROFILE:
Overall score: ${candidate.overallScore}/100
Seniority: ${candidate.seniority ?? 'Unknown'}
Specialization: ${candidate.specialization ?? 'Not specified'}
Years of experience: ${candidate.yearsOfExperience ?? 'Unknown'}

Scores:
- Technical depth: ${candidate.technicalScore}/100
- Experience: ${candidate.experienceScore}/100
- Certifications: ${candidate.certificationScore}/100
- Practical evidence: ${candidate.practicalScore}/100
- Community: ${candidate.communityScore}/100

Specialization tags: ${candidate.specializations.join(', ') || 'None'}
Strengths: ${candidate.strengths.join(', ') || 'None listed'}
Growth areas: ${candidate.growthAreas.join(', ') || 'None listed'}
Narrative: ${candidate.narrative ?? 'Not available'}

---
JOB POSTING:
${jobText.slice(0, 6000)}`
}
