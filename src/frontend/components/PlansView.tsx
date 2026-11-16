import Link from 'next/link'
import { PageFrame } from '@frontend/layouts/PageFrame'
import { Icon } from '@frontend/components/icons'
import { pricingTiers } from '@frontend/data/curriculum'

export function PlansView() {
  return (
    <PageFrame title="Plans & Packages" eyebrow="Choose your learning path">
      <div className="grid gap-5 lg:grid-cols-3">
        {pricingTiers.map((tier) => (
          <article
            key={tier.name}
            className={`card relative flex flex-col p-7 ${tier.popular ? 'border-emerald-400/40 bg-emerald-400/[.035]' : ''}`}
          >
            {tier.popular && (
              <span className="absolute right-5 top-5 rounded-full bg-emerald-300 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#05131d]">
                Most popular
              </span>
            )}
            <p className="text-sm font-semibold text-emerald-300">{tier.name}</p>
            <p className="mt-5 text-4xl font-semibold tracking-tight">
              {tier.price}
              <span className="text-sm font-normal text-slate-500">
                {tier.price.startsWith('$') ? ' / package' : ''}
              </span>
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-400">{tier.description}</p>
            <ul className="my-7 space-y-3 text-sm text-slate-300">
              {tier.features.map((x) => (
                <li key={x} className="flex gap-3">
                  <Icon name="check" className="mt-0.5 size-4 text-emerald-300" />
                  {x}
                </li>
              ))}
            </ul>
            <p className="mb-5 mt-auto text-xs text-slate-500">Validity: {tier.validity}</p>
            <Link
              href={`/checkout?plan=${tier.name.toLowerCase()}`}
              className={
                tier.popular ? 'button-primary justify-center' : 'button-secondary justify-center'
              }
            >
              Buy now
            </Link>
          </article>
        ))}
      </div>
    </PageFrame>
  )
}
