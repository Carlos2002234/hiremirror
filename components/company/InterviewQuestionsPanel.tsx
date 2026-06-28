'use client'

import { useState } from 'react'
import { Loader2, MessageSquare, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface Question {
  category: string
  question: string
  rationale: string
}

interface Props {
  jobId: string
  candidateId: string
  initialQuestions: Question[] | null
}

const CATEGORY_VARIANT: Record<string, 'brand' | 'warning' | 'success' | 'default'> = {
  Technical: 'brand',
  'Role-Specific': 'success',
  Behavioral: 'warning',
  Growth: 'default',
}

export function InterviewQuestionsPanel({ jobId, candidateId, initialQuestions }: Props) {
  const [questions, setQuestions] = useState<Question[] | null>(initialQuestions)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleGenerate() {
    setStatus('loading')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/company/interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, candidateId }),
      })
      const body = await res.json()

      if (!res.ok) {
        setErrorMsg(body.error ?? 'Error inesperado')
        setStatus('error')
        return
      }

      setQuestions(body.questions as Question[])
      setStatus('idle')
    } catch {
      setErrorMsg('Error de red.')
      setStatus('error')
    }
  }

  return (
    <div className="space-y-3 mt-3">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={questions ? 'outline' : 'primary'}
          onClick={handleGenerate}
          disabled={status === 'loading'}
          className="gap-2"
        >
          {status === 'loading' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : questions ? (
            <RefreshCw className="h-3.5 w-3.5" />
          ) : (
            <MessageSquare className="h-3.5 w-3.5" />
          )}
          {status === 'loading'
            ? 'Generando...'
            : questions
            ? 'Regenerar preguntas'
            : 'Generar preguntas de entrevista'}
        </Button>
        {status === 'error' && errorMsg && (
          <p className="text-xs text-danger">{errorMsg}</p>
        )}
      </div>

      {questions && questions.length > 0 && (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div
              key={i}
              className="rounded-lg border border-surface-700 bg-surface-800/50 p-3 space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-surface-500 tabular-nums">#{i + 1}</span>
                <Badge variant={CATEGORY_VARIANT[q.category] ?? 'default'}>
                  {q.category}
                </Badge>
              </div>
              <p className="text-sm text-surface-100 leading-relaxed">{q.question}</p>
              <p className="text-xs text-surface-500 italic">→ {q.rationale}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
