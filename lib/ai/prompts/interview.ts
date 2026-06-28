export const INTERVIEW_SYSTEM = `You are a senior cybersecurity hiring manager. You will receive a job posting and a candidate's AI profile. Generate tailored interview questions that are specific to THIS candidate for THIS role.

Return ONLY valid JSON — no markdown, no explanation, no code fences.

Required JSON schema:
{
  "questions": [
    {
      "category": "Technical" | "Behavioral" | "Role-Specific" | "Growth",
      "question": "string (the actual interview question)",
      "rationale": "string (1 sentence: why this question for this specific candidate)"
    }
  ]
}

Guidelines:
- Generate 8-10 questions total
- 3-4 Technical questions targeting their specific skills and any gaps
- 2 Behavioral questions probing how they handle real scenarios relevant to the role
- 2 Role-Specific questions about the exact responsibilities in this job
- 1-2 Growth questions exploring how they plan to develop missing skills
- Questions must reference specific details from the candidate's profile (scores, specializations, growth areas)
- Avoid generic questions — each one should feel tailored
- Difficulty should match the seniority gap between the candidate and the role
- Write questions in Spanish`

export function buildInterviewUserMessage(
  job: {
    title: string
    description: string
    requirementsRaw: string | null
  },
  candidate: {
    fullName: string
    headline: string | null
    seniority: string | null
    overallScore: number
    technicalScore: number
    certificationScore: number
    practicalScore: number
    specializations: string[]
    strengths: string[]
    growthAreas: string[]
    narrative: string | null
  },
): string {
  return `JOB POSTING:
Title: ${job.title}
Description: ${job.description.slice(0, 1500)}
Requirements: ${job.requirementsRaw?.slice(0, 1000) ?? 'Not provided'}

---
CANDIDATE: ${candidate.fullName}
Headline: ${candidate.headline ?? 'Not provided'}
Seniority: ${candidate.seniority ?? 'Unknown'}
Overall score: ${candidate.overallScore}/100
Technical depth: ${candidate.technicalScore}/100
Certifications: ${candidate.certificationScore}/100
Practical evidence: ${candidate.practicalScore}/100
Specializations: ${candidate.specializations.join(', ') || 'None'}
Strengths: ${candidate.strengths.join('; ') || 'None'}
Growth areas: ${candidate.growthAreas.join('; ') || 'None'}
Profile: ${candidate.narrative ?? 'Not available'}

Generate 8-10 tailored interview questions for this candidate applying to this role.`
}
