import { Shield } from 'lucide-react'
import Link from 'next/link'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-900 flex flex-col">
      <header className="flex items-center gap-2 px-6 py-5 border-b border-surface-800">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 ring-1 ring-brand-500/30">
          <Shield className="h-4 w-4 text-brand-400" />
        </div>
        <Link href="/" className="font-bold text-surface-50">
          HireMirror
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  )
}
