import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const SECURITY_TOPICS = new Set([
  'ctf', 'security', 'pentest', 'penetration-testing', 'malware', 'exploit',
  'vulnerability', 'forensics', 'reverse-engineering', 'web-security', 'osint',
  'cybersecurity', 'ethical-hacking', 'red-team', 'blue-team', 'bug-bounty',
  'xss', 'sql-injection', 'buffer-overflow', 'cryptography', 'network-security',
  'incident-response', 'threat-intelligence', 'dfir', 'soc', 'hacking',
  'hackthebox', 'tryhackme', 'writeup', 'kali', 'metasploit', 'nmap', 'burpsuite',
])

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  let username: string
  try {
    const body = await request.json()
    username = typeof body.username === 'string' ? body.username.trim().replace(/^@/, '') : ''
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  if (!username) return NextResponse.json({ error: 'Username requerido' }, { status: 400 })

  const ghHeaders: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'HireMirror',
  }

  const [profileRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers: ghHeaders }),
    fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`, { headers: ghHeaders }),
  ])

  if (!profileRes.ok) {
    return NextResponse.json(
      { error: profileRes.status === 404 ? 'Usuario de GitHub no encontrado' : 'Error al consultar GitHub' },
      { status: profileRes.status === 404 ? 404 : 502 },
    )
  }

  const ghProfile = await profileRes.json()
  const repos: Record<string, unknown>[] = reposRes.ok ? await reposRes.json() : []

  const langMap: Record<string, number> = {}
  const securityRepos: Array<{ name: string; description: string; stars: number; topics: string[] }> = []

  for (const repo of Array.isArray(repos) ? repos : []) {
    if (repo.fork) continue

    const lang = repo.language as string | null
    if (lang) langMap[lang] = (langMap[lang] ?? 0) + 1

    const topics = (repo.topics as string[]) ?? []
    const name = (repo.name as string)?.toLowerCase() ?? ''
    const desc = (repo.description as string)?.toLowerCase() ?? ''

    const isSecurity =
      topics.some(t => SECURITY_TOPICS.has(t.toLowerCase())) ||
      [...SECURITY_TOPICS].some(k => name.includes(k) || desc.includes(k))

    if (isSecurity) {
      securityRepos.push({
        name: repo.name as string,
        description: (repo.description as string) ?? '',
        stars: (repo.stargazers_count as number) ?? 0,
        topics,
      })
    }
  }

  const topLanguages = Object.entries(langMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([lang]) => lang)

  const processedData = {
    username,
    name: ghProfile.name as string | null,
    bio: ghProfile.bio as string | null,
    followers: ghProfile.followers as number,
    public_repos: ghProfile.public_repos as number,
    top_languages: topLanguages,
    security_repos: securityRepos.slice(0, 20),
    security_repo_count: securityRepos.length,
  }

  const candidateId = (profile as { id: string }).id

  const { data: source, error } = await supabase
    .from('evidence_sources')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert({
      candidate_id: candidateId,
      source_type: 'github',
      url: `https://github.com/${username}`,
      raw_data: { followers: ghProfile.followers, public_repos: ghProfile.public_repos, name: ghProfile.name },
      processed_data: processedData,
      status: 'ready',
      last_synced_at: new Date().toISOString(),
    } as any, { onConflict: 'candidate_id,source_type' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ source, stats: processedData })
}
