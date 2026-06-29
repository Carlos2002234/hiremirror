'use client'

import { useState } from 'react'
import { GitFork, ExternalLink, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import type { Database } from '@/types/supabase'

type EvidenceSource = Database['public']['Tables']['evidence_sources']['Row']

interface GitHubStats {
  username: string
  followers: number
  public_repos: number
  security_repo_count: number
  top_languages: string[]
}

export function GitHubConnectCard({ source }: { source: EvidenceSource | null }) {
  const existing = source?.processed_data as GitHubStats | null
  const [username, setUsername] = useState(existing?.username ?? '')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [stats, setStats] = useState<GitHubStats | null>(existing)

  const connected = !!source && source.status === 'ready'
  const isConnected = connected || status === 'done'

  async function handleConnect() {
    if (!username.trim()) return
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/candidate/sources/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      })
      const body = await res.json()

      if (!res.ok) {
        setErrorMsg(body.error ?? 'Error al conectar GitHub')
        setStatus('error')
        return
      }

      setStats(body.stats)
      setStatus('done')
    } catch {
      setErrorMsg('Error de red. Verifica tu conexión.')
      setStatus('error')
    }
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-700">
            <GitFork className="h-4 w-4 text-surface-300" />
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-100">GitHub</p>
                <p className="text-xs text-surface-500">Repositorios y proyectos públicos de seguridad</p>
              </div>
              {isConnected && (
                <span className="text-xs font-medium text-success">Conectado</span>
              )}
            </div>

            {stats && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-surface-400">
                <span>{stats.public_repos} repos públicos</span>
                <span>{stats.security_repo_count} repos de seguridad</span>
                <span>{stats.followers} seguidores</span>
                {stats.top_languages.length > 0 && (
                  <span>{stats.top_languages.slice(0, 3).join(' · ')}</span>
                )}
                {source?.url && (
                  <a href={source.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-brand-400 hover:text-brand-300">
                    Ver perfil <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <div className="w-52">
                <Input
                  id="github-username"
                  placeholder="tu-username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConnect()}
                />
              </div>
              <Button
                onClick={handleConnect}
                disabled={status === 'loading' || !username.trim()}
                size="sm"
                variant={isConnected ? 'secondary' : 'primary'}
                className="gap-1.5 shrink-0"
              >
                {status === 'loading' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isConnected ? (
                  <RefreshCw className="h-3.5 w-3.5" />
                ) : null}
                {status === 'loading' ? 'Conectando...' : isConnected ? 'Actualizar' : 'Conectar'}
              </Button>
            </div>

            {errorMsg && <p className="text-xs text-danger">{errorMsg}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
