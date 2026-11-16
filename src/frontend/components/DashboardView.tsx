import Link from 'next/link'
import { PageFrame } from '@frontend/layouts/PageFrame'
import { Icon } from '@frontend/components/icons'
import { featureLinks } from '@frontend/data/curriculum'

export function DashboardView() {
  return (
    <PageFrame title="Dashboard" eyebrow="Your learning workspace">
      <div className="grid gap-4 md:grid-cols-2">
        {featureLinks.map((f, index) => (
          <Link
            href={f.href}
            key={f.title}
            className={`group card flex min-h-44 flex-col justify-between p-6 ${index === 4 ? 'md:col-span-2' : ''}`}
          >
            <div className="flex items-start justify-between">
              <span className="grid size-11 place-items-center rounded-xl border border-white/8 bg-white/[.04] text-emerald-300">
                <Icon name={f.icon} className="size-5" />
              </span>
              <Icon
                name="arrow"
                className="size-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-300"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{f.title}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">{f.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </PageFrame>
  )
}
