import Link from 'next/link'
import { Icon } from './icons'

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight text-white">
      <span className="grid size-9 place-items-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
        <Icon name="shield" className="size-5" />
      </span>
      <span className="hidden sm:block">SANGAM</span>
    </Link>
  )
}
