'use client'

import { Shield, LayoutDashboard, Briefcase, LogOut } from 'lucide-react'
import { NavLink } from '@/components/ui/NavLink'

const NAV_ITEMS = [
  { href: '/company/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/company/jobs', icon: Briefcase, label: 'Vacantes' },
]

export function CompanySidebar() {
  return (
    <aside className="flex w-60 flex-col border-r border-surface-800 bg-surface-900">
      <div className="flex items-center gap-2 border-b border-surface-800 px-4 py-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 ring-1 ring-brand-500/30">
          <Shield className="h-4 w-4 text-brand-400" />
        </div>
        <div>
          <span className="font-bold text-surface-50">HireMirror</span>
          <span className="ml-2 rounded bg-brand-500/10 px-1.5 py-0.5 text-xs text-brand-400">
            Empresa
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map(item => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      <div className="border-t border-surface-800 p-3">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-surface-500 transition-colors hover:bg-surface-800 hover:text-surface-300"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
