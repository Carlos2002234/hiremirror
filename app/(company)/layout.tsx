import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CompanySidebar } from '@/components/company/CompanySidebar'

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const userResult = await supabase.from('users').select('role').eq('id', user.id).single()
  const userRecord = userResult.data as { role: string } | null

  if (userRecord?.role === 'candidate') redirect('/dashboard')

  return (
    <div className="flex min-h-screen bg-surface-900">
      <CompanySidebar />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
