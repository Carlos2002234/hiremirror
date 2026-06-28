import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JobPostingForm } from '@/components/company/JobPostingForm'

export const metadata = { title: 'Nueva vacante · HireMirror' }

export default async function NewJobPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: companyRaw } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_user_id', user.id)
    .single()

  if (!companyRaw) redirect('/onboarding/recruiter')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-50">Nueva vacante</h1>
        <p className="mt-1 text-sm text-surface-400">
          Completa los detalles del puesto. Los requisitos técnicos son usados por la IA para hacer matching.
        </p>
      </div>

      <JobPostingForm />
    </div>
  )
}
