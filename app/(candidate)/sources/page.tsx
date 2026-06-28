import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CvUploadCard } from '@/components/candidate/CvUploadCard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { GitFork, Globe, Trophy, Bug, BookOpen } from 'lucide-react'
import type { Database } from '@/types/supabase'

export const metadata = { title: 'Mis fuentes · HireMirror' }

type EvidenceSource = Database['public']['Tables']['evidence_sources']['Row']

const SOURCE_META: Record<string, { label: string; icon: React.ElementType; desc: string; comingSoon?: boolean }> = {
  cv: { label: 'CV', icon: BookOpen, desc: 'Tu hoja de vida en PDF o DOCX' },
  github: { label: 'GitHub', icon: GitFork, desc: 'Repositorios, commits y proyectos públicos', comingSoon: true },
  htb: { label: 'HackTheBox', icon: Trophy, desc: 'Máquinas resueltas y ranking', comingSoon: true },
  tryhackme: { label: 'TryHackMe', icon: Trophy, desc: 'Salas completadas y ruta de aprendizaje', comingSoon: true },
  bugcrowd: { label: 'Bugcrowd', icon: Bug, desc: 'Bug bounties y reportes enviados', comingSoon: true },
  hackerone: { label: 'HackerOne', icon: Bug, desc: 'Vulnerabilidades reportadas', comingSoon: true },
  portswigger: { label: 'PortSwigger', icon: Globe, desc: 'Web Security Academy labs', comingSoon: true },
  ctftime: { label: 'CTFtime', icon: Trophy, desc: 'Competencias CTF y posiciones', comingSoon: true },
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    ready: 'text-success',
    processing: 'text-warning',
    error: 'text-danger',
    pending: 'text-surface-400',
  }
  const labels: Record<string, string> = {
    ready: 'Listo',
    processing: 'Procesando',
    error: 'Error',
    pending: 'Pendiente',
  }
  return { color: map[status] ?? 'text-surface-400', label: labels[status] ?? status }
}

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

  const cvSource = sourceMap.get('cv') ?? null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-50">Mis fuentes</h1>
        <p className="mt-1 text-sm text-surface-400">
          Conecta tus plataformas de evidencia. La IA analizará todo para construir tu perfil.
        </p>
      </div>

      {/* CV Upload */}
      <CvUploadCard source={cvSource} />

      {/* Other sources */}
      <div>
        <h2 className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-3">
          Plataformas de práctica
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(['github', 'htb', 'tryhackme', 'portswigger', 'bugcrowd', 'hackerone', 'ctftime'] as const).map(type => {
            const meta = SOURCE_META[type]
            const source = sourceMap.get(type)
            const Icon = meta.icon
            const { color, label } = source ? statusBadge(source.status) : { color: 'text-surface-600', label: '' }

            return (
              <Card key={type} className={meta.comingSoon ? 'opacity-60' : ''}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-700">
                    <Icon className="h-4 w-4 text-surface-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-surface-100">{meta.label}</p>
                      {meta.comingSoon && (
                        <span className="text-xs text-surface-500 border border-surface-600 rounded px-1.5 py-0.5">
                          Próximamente
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-surface-500 truncate">{meta.desc}</p>
                  </div>
                  {source && (
                    <span className={`text-xs font-medium shrink-0 ${color}`}>{label}</span>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
