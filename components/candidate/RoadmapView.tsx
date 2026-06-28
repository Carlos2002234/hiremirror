'use client'

import { useState, useEffect } from 'react'
import {
  Loader2, RefreshCw, Award, Terminal, BookOpen, Wrench, Users,
  Target, Clock, ChevronRight, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface RoadmapAction {
  type: 'certification' | 'lab' | 'course' | 'project' | 'community'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

interface RoadmapPhase {
  phase: number
  title: string
  duration_months: number
  goal: string
  actions: RoadmapAction[]
}

interface Roadmap {
  focus_area: string
  current_level: string
  target_level: string
  estimated_months: number
  summary: string
  phases: RoadmapPhase[]
}

interface Stored {
  roadmap: Roadmap
  generatedAt: string
}

const STORAGE_KEY = 'hiremirror_roadmap'

const ACTION_ICONS: Record<RoadmapAction['type'], React.ElementType> = {
  certification: Award,
  lab: Terminal,
  course: BookOpen,
  project: Wrench,
  community: Users,
}

const ACTION_COLORS: Record<RoadmapAction['type'], string> = {
  certification: 'text-brand-400',
  lab: 'text-emerald-400',
  course: 'text-amber-400',
  project: 'text-violet-400',
  community: 'text-pink-400',
}

const PRIORITY_VARIANT: Record<RoadmapAction['priority'], 'danger' | 'warning' | 'default'> = {
  high: 'danger',
  medium: 'warning',
  low: 'default',
}

const PRIORITY_LABEL: Record<RoadmapAction['priority'], string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
}

const LEVEL_LABEL: Record<string, string> = {
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
  staff: 'Staff',
  principal: 'Principal',
}

export function RoadmapView() {
  const [stored, setStored] = useState<Stored | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setStored(JSON.parse(raw) as Stored)
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true)
  }, [])

  async function handleGenerate() {
    setStatus('loading')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/candidate/generate-roadmap', { method: 'POST' })
      const body = await res.json()

      if (!res.ok) {
        setErrorMsg(body.error ?? 'Error inesperado')
        setStatus('error')
        return
      }

      const next: Stored = { roadmap: body.roadmap as Roadmap, generatedAt: body.generatedAt as string }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setStored(next)
      setStatus('idle')
    } catch {
      setErrorMsg('Error de red. Verifica tu conexión.')
      setStatus('error')
    }
  }

  if (!hydrated) return null

  const roadmap = stored?.roadmap

  return (
    <div className="space-y-6">
      {/* Generate / Regenerate bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          {stored && (
            <p className="text-xs text-surface-500">
              Generado el{' '}
              {new Date(stored.generatedAt).toLocaleDateString('es-CR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
        <Button
          onClick={handleGenerate}
          disabled={status === 'loading'}
          variant={roadmap ? 'outline' : 'primary'}
          className="gap-2"
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : roadmap ? (
            <RefreshCw className="h-4 w-4" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {status === 'loading'
            ? 'Generando...'
            : roadmap
            ? 'Regenerar roadmap'
            : 'Generar mi roadmap'}
        </Button>
      </div>

      {status === 'loading' && (
        <p className="text-xs text-surface-500">
          La IA está construyendo tu plan personalizado. Puede tardar 30-60 segundos.
        </p>
      )}

      {status === 'error' && errorMsg && (
        <p className="text-sm text-danger">{errorMsg}</p>
      )}

      {!roadmap && status !== 'loading' && (
        <Card className="border-dashed border-surface-600 bg-transparent text-center">
          <CardContent className="py-16 space-y-3">
            <Target className="mx-auto h-12 w-12 text-surface-600" />
            <p className="font-medium text-surface-300">Tu roadmap personalizado aparecerá aquí</p>
            <p className="text-sm text-surface-500">
              La IA analizará tus brechas y construirá un plan paso a paso para avanzar en tu carrera.
            </p>
          </CardContent>
        </Card>
      )}

      {roadmap && (
        <div className="space-y-6">
          {/* Header card */}
          <Card className="bg-brand-500/5 border-brand-500/20">
            <CardContent className="py-5">
              <div className="flex flex-wrap items-start gap-4 justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-surface-500 uppercase tracking-wider font-semibold">
                    Área de enfoque
                  </p>
                  <p className="text-lg font-bold text-surface-50">{roadmap.focus_area}</p>
                  <div className="flex items-center gap-2 text-sm text-surface-400">
                    <span>{LEVEL_LABEL[roadmap.current_level] ?? roadmap.current_level}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-brand-400" />
                    <span className="text-brand-400 font-medium">
                      {LEVEL_LABEL[roadmap.target_level] ?? roadmap.target_level}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-surface-400">
                  <Clock className="h-4 w-4 text-brand-400" />
                  <span>~{roadmap.estimated_months} meses</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-surface-300 leading-relaxed">{roadmap.summary}</p>
            </CardContent>
          </Card>

          {/* Timeline phases */}
          <div className="relative space-y-4">
            {/* Vertical line */}
            <div className="absolute left-5 top-5 bottom-5 w-px bg-surface-700 hidden sm:block" />

            {roadmap.phases.map((phase) => (
              <div key={phase.phase} className="sm:pl-14 relative">
                {/* Phase number bubble */}
                <div className="absolute left-0 top-0 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 font-bold text-sm">
                  {phase.phase}
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 sm:hidden mb-1">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 font-bold text-xs">
                            {phase.phase}
                          </span>
                        </div>
                        <CardTitle className="text-base">{phase.title}</CardTitle>
                        <p className="text-xs text-surface-500 mt-0.5">
                          {phase.duration_months}{' '}
                          {phase.duration_months === 1 ? 'mes' : 'meses'}
                        </p>
                      </div>
                      <Badge variant="brand">
                        <Target className="h-3 w-3 mr-1" />
                        {phase.goal}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {phase.actions.map((action, i) => {
                      const Icon = ACTION_ICONS[action.type]
                      const iconColor = ACTION_COLORS[action.type]

                      return (
                        <div
                          key={i}
                          className="flex items-start gap-3 rounded-lg bg-surface-800/60 p-3"
                        >
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-700">
                            <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-surface-100">
                                {action.title}
                              </span>
                              <Badge variant={PRIORITY_VARIANT[action.priority]}>
                                {PRIORITY_LABEL[action.priority]}
                              </Badge>
                            </div>
                            <p className="text-xs text-surface-400 leading-relaxed">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
