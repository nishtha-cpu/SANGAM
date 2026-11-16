import Link from 'next/link'
import { Header } from '@frontend/layouts/Header'
import { Footer } from '@frontend/layouts/Footer'
import { Icon } from '@frontend/components/icons'
import { featureLinks } from '@frontend/data/curriculum'

export function HomeView() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,rgba(31,211,147,.12),transparent_27%),radial-gradient(circle_at_20%_80%,rgba(37,99,235,.11),transparent_34%)]" />
        <div className="hero-grid absolute inset-0 opacity-40" />
        <section className="relative mx-auto max-w-[1180px] px-5 pb-16 pt-20 lg:px-8 lg:pb-24 lg:pt-28">
          <div className="max-w-4xl">
            <p className="eyebrow mb-5">Immersive security architecture lab</p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.04] tracking-[-.045em] text-white md:text-7xl">
              Security Architecture <span className="text-gradient">Next Generation</span>{' '}
              Assessment Model
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">
              Learn security and solution architecture through practical exercises, scenario-based
              quizzes, recorded classes and AI-assisted design reviews.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/dashboard" className="button-primary">
                Go to Dashboard <Icon name="arrow" className="size-4" />
              </Link>
              <Link href="/design-review" className="button-secondary">
                Try a Design Review
              </Link>
            </div>
          </div>
          <div className="mt-18 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featureLinks.slice(1).map((f) => (
              <Link href={f.href} key={f.title} className="group card p-6">
                <span className="mb-8 grid size-10 place-items-center rounded-xl bg-white/5 text-emerald-300">
                  <Icon name={f.icon} className="size-5" />
                </span>
                <h2 className="font-semibold text-white">{f.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{f.description}</p>
                <span className="mt-5 flex items-center gap-2 text-xs font-semibold text-emerald-300 opacity-0 transition group-hover:opacity-100">
                  Explore <Icon name="arrow" className="size-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
