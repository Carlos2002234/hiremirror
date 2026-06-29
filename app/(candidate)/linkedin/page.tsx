import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LinkedInOptimizer } from '@/components/candidate/LinkedInOptimizer'

export const metadata = { title: 'LinkedIn Optimizer · HireMirror' }

export default async function LinkedInPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id, primary_specialization')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/onboarding/candidate')

  const { primary_specialization } = profile as { id: string; primary_specialization: string | null }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-50">LinkedIn Optimizer</h1>
        <p className="mt-1 text-sm text-surface-400">
          Pega el contenido de tu perfil y la IA analizará cada sección con recomendaciones específicas para tu marca personal en ciberseguridad.
        </p>
      </div>

      <LinkedInOptimizer specialization={primary_specialization} />
    </div>
  )
}
