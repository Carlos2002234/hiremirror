import { Shield } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-900 px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 ring-1 ring-brand-500/30">
          <Shield className="h-6 w-6 text-brand-400" />
        </div>
        <Link href="/" className="text-xl font-bold tracking-tight text-surface-50">
          HireMirror
        </Link>
        <p className="text-xs text-surface-500">Powered by AI · Built for Security Professionals</p>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
