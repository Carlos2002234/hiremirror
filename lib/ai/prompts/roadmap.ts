export const ROADMAP_SYSTEM = `You are a senior cybersecurity career coach. You will receive a candidate's AI profile with their current scores, strengths, and growth areas. Generate a detailed, actionable learning roadmap to advance their career.

Return ONLY valid JSON — no markdown, no explanation, no code fences.

Required JSON schema:
{
  "focus_area": "string (main specialization to develop, e.g. 'Penetration Testing', 'Cloud Security')",
  "current_level": "junior" | "mid" | "senior" | "staff" | "principal",
  "target_level": "junior" | "mid" | "senior" | "staff" | "principal",
  "estimated_months": number (realistic total duration),
  "summary": "string (3-4 sentences in Spanish, motivating and specific to the candidate)",
  "phases": [
    {
      "phase": number (1, 2, 3...),
      "title": "string (short phase title)",
      "duration_months": number,
      "goal": "string (one clear measurable goal for this phase)",
      "actions": [
        {
          "type": "certification" | "lab" | "course" | "project" | "community",
          "title": "string (specific name, e.g. 'OSCP', 'HTB Pro Labs: RastaLabs')",
          "description": "string (1-2 sentences, why this specifically)",
          "priority": "high" | "medium" | "low"
        }
      ]
    }
  ]
}

Rules:
- 3 phases maximum, 2 minimum
- Each phase has 3-6 actions
- Actions must be specific (real cert names, real lab platforms, real courses)
- Prioritize the candidate's weakest scoring dimensions
- high-priority actions should come first in each phase
- The roadmap must feel achievable, not overwhelming
- Focus on cybersecurity domain: OSCP, CEH, CISSP, CompTIA, HTB, TryHackMe, PortSwigger, Bug Bounty, CTF, GitHub security projects, etc.
- target_level is always one step above current_level (don't jump more than one level)`

export function buildRoadmapUserMessage(candidate: {
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
  yearsExperience: number | null
  primarySpecialization: string | null
}): string {
  const weakDimensions = [
    { name: 'Technical depth', score: candidate.technicalScore },
    { name: 'Experience', score: candidate.experienceScore },
    { name: 'Certifications', score: candidate.certificationScore },
    { name: 'Practical evidence', score: candidate.practicalScore },
    { name: 'Community', score: candidate.communityScore },
  ]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(d => `${d.name}: ${d.score}/100`)
    .join(', ')

  return `Generate a personalized career roadmap for this cybersecurity candidate:

Current seniority: ${candidate.seniority ?? 'Unknown'}
Overall score: ${candidate.overallScore}/100
Primary specialization: ${candidate.primarySpecialization ?? 'Not specified'}
Years of experience: ${candidate.yearsExperience ?? 'Unknown'}

Score breakdown:
- Technical depth: ${candidate.technicalScore}/100
- Experience: ${candidate.experienceScore}/100
- Certifications: ${candidate.certificationScore}/100
- Practical evidence: ${candidate.practicalScore}/100
- Community: ${candidate.communityScore}/100

Weakest dimensions (prioritize these): ${weakDimensions}

Specialization tags: ${candidate.specializations.join(', ') || 'None'}
Strengths: ${candidate.strengths.join('; ') || 'None listed'}
Growth areas: ${candidate.growthAreas.join('; ') || 'None listed'}
Narrative: ${candidate.narrative ?? 'Not available'}`
}
