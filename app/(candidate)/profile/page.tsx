import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileEditor } from '@/components/candidate/ProfileEditor'
import type { Database } from '@/types/supabase'

export const metadata = { title: 'Mi perfil · HireMirror' }

type ProfileRow = Database['public']['Tables']['candidate_profiles']['Row']

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-surface-50">Mi perfil</h1>
        <p className="mt-1 text-sm text-surface-400">
          Esta información es visible para empresas que revisen tu candidatura.
        </p>
      </div>
      <ProfileEditor profile={profile as ProfileRow | null} userId={user.id} />
    </div>
  )
}
