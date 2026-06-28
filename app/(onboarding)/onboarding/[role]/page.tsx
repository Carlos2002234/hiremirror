import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingForm } from '@/components/candidate/OnboardingForm'
import { CompanySetupForm } from '@/components/company/CompanySetupForm'

export const metadata = { title: 'Configura tu perfil · HireMirror' }

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ role: string }>
}) {
  const { role } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Recruiter onboarding
  if (role === 'recruiter') {
    const { data: companyRaw } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_user_id', user.id)
      .single()

    if (companyRaw) redirect('/company/dashboard')

    return <CompanySetupForm />
  }

  // If already onboarded as candidate, go to dashboard
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id, full_name')
    .eq('user_id', user.id)
    .single()

  const p = profile as { id: string; full_name: string | null } | null
  if (p?.full_name) redirect('/dashboard')

  const userMeta = user.user_metadata as { full_name?: string } | null

  return (
    <OnboardingForm
      userId={user.id}
      initialName={userMeta?.full_name ?? ''}
    />
  )
}
