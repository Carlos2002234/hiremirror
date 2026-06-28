import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { RoadmapView } from '@/components/candidate/RoadmapView'
import { Card, CardContent } from '@/components/ui/Card'
import { Target } from 'lucide-react'

export const metadata = { title: 'Mi roadmap · HireMirror' }

export default async function RoadmapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const profile = profileRaw as { id: string } | null
  if (!profile) redirect('/onboarding/candidate')

  const { data: aiRaw } = await supabase
    .from('ai_profiles')
    .select('id')
    .eq('candidate_id', profile.id)
    .single()

  const hasAiProfile = !!aiRaw

  if (!hasAiProfile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-surface-50">Mi roadmap</h1>
        <Card className="border-dashed border-surface-600 bg-transparent text-center">
          <CardContent className="py-16 space-y-4">
            <Target className="mx-auto h-12 w-12 text-surface-600" />
            <p className="font-medium text-surface-300">
              Necesitas un perfil de IA para generar tu roadmap
            </p>
            <p className="text-sm text-surface-500">
              Sube tu CV y genera tu perfil de IA primero.
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-2 text-sm text-brand-400 underline underline-offset-2 hover:text-brand-300"
            >
              Ir al Dashboard →
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-50">Mi roadmap</h1>
        <p className="mt-1 text-sm text-surface-400">
          Plan de carrera personalizado basado en tus brechas y objetivos actuales.
        </p>
      </div>

      <RoadmapView />
    </div>
  )
}
