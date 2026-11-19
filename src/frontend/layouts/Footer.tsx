import Link from 'next/link'
import { Logo } from '@frontend/components/Logo'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[.08] bg-[#040c17] text-slate-400">
      <div className="mx-auto max-w-[1320px] px-5 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand info */}
          <div className="sm:col-span-2 space-y-4">
            <Logo />
            <p className="max-w-sm text-xs leading-relaxed text-slate-400">
              SANGAM is an immersive Security Architecture learning platform. We empower software architects, cloud engineers, and AppSec professionals to design, evaluate, and defend zero-trust systems.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500">
              <span className="inline-block size-2 rounded-full bg-emerald-400"></span>
              Figma Cloud &amp; Next.js Verified Enterprise Architecture
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Platform</p>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-emerald-300 transition">Home</Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-emerald-300 transition">Explore Courses</Link>
              </li>
              <li>
                <Link href="/plans" className="hover:text-emerald-300 transition">Pricing &amp; Plans</Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-emerald-300 transition">Security Quizzes</Link>
              </li>
              <li>
                <Link href="/design-review" className="hover:text-emerald-300 transition">Design Review Lab</Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Company</p>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/about" className="hover:text-emerald-300 transition">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-300 transition">Contact Us</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-300 transition">FAQs</Link>
              </li>
              <li>
                <Link href="/admin-login" className="text-slate-500 hover:text-amber-400 transition">Admin Portal</Link>
              </li>
            </ul>
          </div>

          {/* Legal Policies */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Legal &amp; Trust</p>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-emerald-300 transition">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-300 transition">Terms &amp; Conditions</Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-emerald-300 transition">Refund &amp; Cancellation</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[.06] pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 SANGAM Learning Platform. All rights reserved.</p>
          <p>Security by Design · Zero Trust Ready · Hands-on Labs</p>
        </div>
      </div>
    </footer>
  )
}
