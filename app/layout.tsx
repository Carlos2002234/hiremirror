import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'HireMirror', template: '%s | HireMirror' },
  description: 'La plataforma de contratación impulsada por IA para profesionales de ciberseguridad.',
  keywords: ['ciberseguridad', 'empleo', 'IA', 'pentesting', 'SOC', 'red team', 'blue team'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  )
}
