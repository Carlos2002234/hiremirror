'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Database } from '@/types/supabase'

type EvidenceSource = Database['public']['Tables']['evidence_sources']['Row']

interface Props {
  source: EvidenceSource | null
}

export function CvUploadCard({ source }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const hasCV = !!source
  const cvReady = source?.status === 'ready' || source?.status === 'pending'

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError('')
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/candidate/cv', { method: 'POST', body: form })
    setUploading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Error al subir el CV')
      return
    }
    setDone(true)
    setFile(null)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-brand-400" />
          Curriculum Vitae
        </CardTitle>
        <CardDescription>
          {hasCV
            ? cvReady
              ? 'CV subido. La IA lo procesará cuando generes tu perfil.'
              : 'Error al procesar el CV anterior. Puedes subir uno nuevo.'
            : 'Sube tu CV en PDF o DOCX. La IA extraerá habilidades y experiencia.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {done ? (
          <div className="flex items-center gap-2 text-success text-sm">
            <CheckCircle className="h-4 w-4" />
            CV actualizado correctamente
          </div>
        ) : (
          <div className="space-y-3">
            {hasCV && (
              <div className="flex items-center gap-2 text-sm text-surface-400">
                {source.status === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-danger" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-success" />
                )}
                CV {source.status === 'error' ? 'con error' : 'cargado'}
                <span className="text-xs text-surface-600 ml-1">
                  (actualizado {new Date(source.last_synced_at!).toLocaleDateString('es-CR')})
                </span>
              </div>
            )}

            <div
              onClick={() => fileRef.current?.click()}
              className={cn(
                'flex items-center gap-3 rounded-xl border-2 border-dashed px-5 py-4 cursor-pointer transition-colors',
                file
                  ? 'border-brand-500 bg-brand-500/5'
                  : 'border-surface-700 hover:border-surface-600'
              )}
            >
              <Upload className={cn('h-5 w-5 shrink-0', file ? 'text-brand-400' : 'text-surface-500')} />
              <div className="min-w-0">
                {file ? (
                  <>
                    <p className="text-sm font-medium text-surface-200 truncate">{file.name}</p>
                    <p className="text-xs text-surface-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </>
                ) : (
                  <p className="text-sm text-surface-400">
                    {hasCV ? 'Haz clic para reemplazar tu CV' : 'Haz clic para seleccionar tu CV'}
                    <span className="ml-1 text-surface-600">· PDF o DOCX · máx 10 MB</span>
                  </p>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) { setFile(f); setError('') }
                }}
              />
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-sm text-danger">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </p>
            )}

            {file && (
              <Button onClick={handleUpload} loading={uploading} size="sm">
                {uploading ? 'Subiendo...' : hasCV ? 'Reemplazar CV' : 'Subir CV'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
