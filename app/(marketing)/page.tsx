import Link from 'next/link'
import { Shield, Zap, BarChart3, Target, ArrowRight, Upload, Brain, Search, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const SPECIALIZATIONS = [
  'SOC Analyst', 'Red Team', 'Blue Team', 'Pentester',
  'Security Engineer', 'Cloud Security', 'AppSec', 'DevSecOps',
  'DFIR', 'Threat Hunter', 'Malware Analyst', 'GRC',
]

const STATS = [
  { value: '500+', label: 'Candidatos analizados' },
  { value: '50+', label: 'Empresas registradas' },
  { value: '10K+', label: 'Preguntas generadas' },
  { value: '94%', label: 'Tasa de satisfacción' },
]

const STEPS = [
  {
    icon: Upload,
    step: '01',
    title: 'Sube tu CV',
    description: 'PDF o DOCX. Opcional: conecta GitHub, HackTheBox, TryHackMe y más plataformas.',
  },
  {
    icon: Brain,
    step: '02',
    title: 'La IA genera tu perfil',
    description: 'Claude analiza tu evidencia y produce un score detallado en 5 dimensiones técnicas.',
  },
  {
    icon: Search,
    step: '03',
    title: 'Analiza vacantes y crece',
    description: 'Pega cualquier oferta. Obtén tu % de match, brechas exactas y un roadmap personalizado.',
  },
]

const FEATURES = [
  {
    icon: Shield,
    title: 'Perfil basado en evidencia real',
    description: 'No inventamos tu score. Analizamos tu CV, labs, CTFs y certificaciones para darte una evaluación honesta y objetiva.',
  },
  {
    icon: Target,
    title: 'Análisis de compatibilidad con vacantes',
    description: 'Pega cualquier oferta de trabajo. Obtén tu % de match, las brechas concretas y qué certificaciones te acercan al puesto.',
  },
  {
    icon: Zap,
    title: 'Feedback que nunca recibirías',
    description: 'Sabe exactamente qué mejorar para conseguir ese rol. Un roadmap con fases, labs reales y prioridades claras.',
  },
  {
    icon: BarChart3,
    title: 'Rankings objetivos para empresas',
    description: 'Evalúa candidatos por evidencia técnica real. Genera preguntas de entrevista personalizadas para cada candidato.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-900">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-surface-800 bg-surface-900/95 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 ring-1 ring-brand-500/30">
            <Shield className="h-4 w-4 text-brand-400" />
          </div>
          <span className="font-bold text-surface-50">HireMirror</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Iniciar sesión</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Empezar gratis</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs text-brand-300">
          <Zap className="h-3 w-3" />
          Impulsado por Claude AI · Construido para Ciberseguridad
        </div>
        <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-tight tracking-tight text-surface-50">
          Tu perfil técnico merece{' '}
          <span className="text-brand-400">más que un CV</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-surface-400 leading-relaxed">
          La plataforma que analiza tu evidencia técnica real — labs, CTFs, proyectos, certificaciones —
          y te dice exactamente qué tan competitivo eres para cualquier vacante de seguridad.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Analiza tu perfil gratis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/register?role=recruiter">
            <Button size="lg" variant="secondary">
              Soy empresa →
            </Button>
          </Link>
        </div>

        {/* Specializations */}
        <div className="mt-16 flex flex-wrap justify-center gap-2 max-w-2xl">
          {SPECIALIZATIONS.map(spec => (
            <span
              key={spec}
              className="rounded-full border border-surface-700 bg-surface-800 px-3 py-1 text-xs text-surface-400"
            >
              {spec}
            </span>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-surface-800 bg-surface-800/20 px-6 py-10">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-brand-400">{value}</div>
              <div className="mt-1 text-xs text-surface-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-surface-50">Cómo funciona</h2>
            <p className="mt-3 text-surface-400">Tres pasos para conocer tu valor real en el mercado</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, step, title, description }) => (
              <div key={step} className="relative text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 ring-1 ring-brand-500/20">
                  <Icon className="h-6 w-6 text-brand-400" />
                </div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 translate-x-6 text-4xl font-black text-surface-800">
                  {step}
                </div>
                <h3 className="mb-2 font-semibold text-surface-100">{title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-surface-800 bg-surface-800/30 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-surface-50">
              No somos otra bolsa de empleo
            </h2>
            <p className="mt-3 text-surface-400">
              HireMirror evalúa evidencia técnica, no experiencia redactada
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-surface-700 bg-surface-800 p-6 hover:border-surface-600 transition-colors"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10">
                  <Icon className="h-5 w-5 text-brand-400" />
                </div>
                <h3 className="mb-2 font-semibold text-surface-100">{title}</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-t border-surface-800 px-6 py-16">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-2xl font-bold text-surface-50">
            Lo que dicen los candidatos
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                quote: 'Por fin entendí por qué me rechazaban. El análisis de brechas fue brutal — y exactamente lo que necesitaba.',
                name: 'Andrés M.',
                role: 'Penetration Tester Jr.',
              },
              {
                quote: 'Generé mi roadmap, seguí las recomendaciones 3 meses y pasé de 52 a 78 en mi score. Conseguí el puesto.',
                name: 'Laura V.',
                role: 'SOC Analyst → Red Team',
              },
            ].map(({ quote, name, role }) => (
              <div key={name} className="rounded-xl border border-surface-700 bg-surface-800 p-5 text-left">
                <p className="text-sm text-surface-300 leading-relaxed italic">"{quote}"</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-surface-200">{name}</p>
                    <p className="text-xs text-surface-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-surface-800 bg-brand-500/5 px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-3xl font-bold text-surface-50">
            ¿Listo para saber exactamente dónde estás?
          </h2>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-surface-400">
            {['Gratis para candidatos', 'Sin tarjeta de crédito', 'Resultados en minutos'].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-success" />
                {item}
              </span>
            ))}
          </div>
          <Link href="/register" className="inline-block">
            <Button size="lg" className="gap-2">
              Crear perfil gratis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800 px-6 py-8">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-400" />
            <span className="text-sm font-medium text-surface-300">HireMirror</span>
          </div>
          <p className="text-xs text-surface-600">© 2026 HireMirror · Todos los derechos reservados</p>
          <div className="flex gap-4 text-xs text-surface-600">
            <Link href="/login" className="hover:text-surface-400">Login</Link>
            <Link href="/register" className="hover:text-surface-400">Registro</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
