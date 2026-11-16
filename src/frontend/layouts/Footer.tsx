import Link from 'next/link'

const footerLinks = [
  { label: 'About Us', href: '/' },
  { label: 'Our Services', href: '/plans' },
  { label: 'Support', href: 'mailto:support@sangam.security' },
  { label: 'Contact / Queries', href: 'mailto:contact@sangam.security' },
  { label: 'Terms and Conditions', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
]

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[.07] bg-[#050e19]">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-5 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>© 2026 SANGAM. Security architecture learning, redesigned.</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {footerLinks.map((item) => (
            <Link key={item.label} href={item.href} className="hover:text-slate-300">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
