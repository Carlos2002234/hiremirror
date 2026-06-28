import Link from 'next/link'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-900 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 ring-1 ring-brand-500/30 mb-6">
        <Shield className="h-8 w-8 text-brand-400" />
      </div>
      <h1 className="text-6xl font-black text-surface-700">404</h1>
      <p className="mt-3 text-xl font-semibold text-surface-200">Página no encontrada</p>
      <p className="mt-2 text-sm text-surface-500">
        La ruta que buscas no existe o fue movida.
      </p>
      <Link href="/" className="mt-8">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  )
}
