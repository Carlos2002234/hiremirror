'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

interface NavLinkProps {
  href: string
  icon: React.ElementType
  label: string
}

export function NavLink({ href, icon: Icon, label }: NavLinkProps) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-surface-800 text-surface-50 font-medium'
          : 'text-surface-400 hover:bg-surface-800 hover:text-surface-100',
      )}
    >
      <Icon className={cn('h-4 w-4', active ? 'text-brand-400' : '')} />
      {label}
    </Link>
  )
}
