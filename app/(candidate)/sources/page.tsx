import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CvUploadCard } from '@/components/candidate/CvUploadCard'
import { GitHubConnectCard } from '@/components/candidate/GitHubConnectCard'
import { LinkedInConnectCard } from '@/components/candidate/LinkedInConnectCard'
import { Card, CardContent } from '@/components/ui/Card'
import { Trophy, Bug, Globe } from 'lucide-react'
import type { Database } from '@/types/supabase'

export const metadata = { title: 'Mis fuentes · HireMirror' }

type EvidenceSource = Database['public']['Tables']['evidence_sources']['Row']

const COMING_SOON = [
  { type: 'htb', label: 'HackTheBox', icon: Trophy, desc: 'Máquinas resueltas y ranking' },
  { type: 'tryhackme', label: 'TryHackMe', icon: Trophy, desc: 'Salas completadas y ruta de aprendizaje' },
  { type: 'bugcrowd', label: 'Bugcrowd', icon: Bug, desc: 'Bug bounties y reportes enviados' },
  { type: 'hackerone', label: 'HackerOne', icon: Bug, desc: 'Vulnerabilidades reportadas' },
  { type: 'portswigger', label: 'PortSwigger', icon: Globe, desc: 'Web Security Academy labs' },
  { type: 'ctftime', label: 'CTFtime', icon: Trophy, desc: 'Competencias CTF y posiciones' },
] as const

export default async function SourcesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/onboarding/candidate')

  const candidateId = (profile as { id: string }).id

  const { data: sources } = await supabase
    .from('evidence_sources')
    .select('*')
    .eq('candidate_id', candidateId)

  const sourceMap = new Map<string, EvidenceSource>()
  for (const s of ((sources ?? []) as EvidenceSource[])) {
    sourceMap.set(s.source_type, s)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-50">Mis fuentes</h1>
        <p className="mt-1 text-sm text-surface-400">
          Conecta tus plataformas. La IA analizará todo para construir tu perfil.
        </p>
      </div>

      {/* CV */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500">CV</h2>
        <CvUploadCard source={sourceMap.get('cv') ?? null} />
      </section>

      {/* Perfil profesional */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500">Perfil profesional</h2>
        <GitHubConnectCard source={sourceMap.get('github') ?? null} />
        <LinkedInConnectCard source={sourceMap.get('linkedin') ?? null} />
      </section>

      {/* Próximamente */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500">Próximamente</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {COMING_SOON.map(({ type, label, icon: Icon, desc }) => (
            <Card key={type} className="opacity-50">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-700">
                  <Icon className="h-4 w-4 text-surface-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-surface-100">{label}</p>
                    <span className="text-xs text-surface-500 border border-surface-600 rounded px-1.5 py-0.5">
                      Próximamente
                    </span>
                  </div>
                  <p className="text-xs text-surface-500 truncate">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
