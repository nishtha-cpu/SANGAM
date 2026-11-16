'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Icon } from '@/app/(frontend)/components/icons'
import { adminLogoutAction } from '@admin-panel/auth/admin-actions'
import type { AdminUser } from '@admin-panel/auth/admin-auth'

export interface AdminDashboardLayoutProps {
  admin: AdminUser
  telemetryAvailable?: boolean
  counts?: {
    learners?: number
    activeLearners?: number
    classes?: number
    caseStudies?: number
    quizzes?: number
    patterns?: number
    pendingReviews?: number
    orders?: number
  }
  children: React.ReactNode
}

interface NavItem {
  label: string
  href: string
  icon: string
  active?: boolean
  count?: number
  badge?: string
  highlightBadge?: boolean
}

export function AdminDashboardLayout({
  admin,
  telemetryAvailable = false,
  counts = {},
  children,
}: AdminDashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const safeCounts = {
    learners: counts.learners ?? 0,
    activeLearners: counts.activeLearners ?? 0,
    classes: counts.classes ?? 0,
    caseStudies: counts.caseStudies ?? 0,
    quizzes: counts.quizzes ?? 0,
    patterns: counts.patterns ?? 0,
    pendingReviews: counts.pendingReviews ?? 0,
    orders: counts.orders ?? 0,
  }

  const handleLogout = () => {
    startTransition(async () => {
      await adminLogoutAction()
      router.push('/admin-login')
      router.refresh()
    })
  }

  const navItems: NavItem[] = [
    {
      label: 'Overview',
      href: '/admin-dashboard',
      icon: 'grid',
      active: pathname === '/admin-dashboard',
    },
    {
      label: 'Classes & Curriculum',
      href: '/admin-dashboard#curriculum',
      icon: 'video',
      count: safeCounts.classes,
      badge: 'Phase 2+',
    },
    {
      label: 'Case Studies',
      href: '/admin-dashboard#cases',
      icon: 'layers',
      count: safeCounts.caseStudies,
      badge: 'Phase 2+',
    },
    {
      label: 'Quizzes',
      href: '/admin-dashboard#quizzes',
      icon: 'book',
      count: safeCounts.quizzes,
      badge: 'Phase 2+',
    },
    {
      label: 'Security Patterns',
      href: '/admin-dashboard#patterns',
      icon: 'shield',
      count: safeCounts.patterns,
      badge: 'Phase 2+',
    },
    {
      label: 'Student Reviews',
      href: '/admin-dashboard/reviews',
      icon: 'spark',
      count: safeCounts.pendingReviews,
      badge: safeCounts.pendingReviews > 0 ? `${safeCounts.pendingReviews} pending` : undefined,
      highlightBadge: safeCounts.pendingReviews > 0,
      active: pathname.startsWith('/admin-dashboard/reviews'),
    },
    {
      label: 'Orders & Plans',
      href: '/admin-dashboard#orders',
      icon: 'lock',
      count: safeCounts.orders,
      badge: 'Phase 2+',
    },
    {
      label: 'Learner Directory',
      href: '/admin-dashboard#learners',
      icon: 'user',
      count: safeCounts.learners,
      badge: 'Phase 2+',
    },
  ]

  return (
    <div className="flex min-h-screen bg-[#040c17] text-slate-100">
      {/* Sidebar Desktop */}
      <aside className="hidden w-72 shrink-0 flex-col justify-between border-r border-white/[0.08] bg-[#071322] p-6 lg:flex">
        <div className="space-y-8">
          {/* Logo & Platform Badge */}
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.12)]">
                <Icon name="shield" className="size-5" />
              </span>
              <div>
                <span className="text-base font-bold tracking-tight text-white">SANGAM</span>
                <span className="ml-1.5 rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Admin
                </span>
                <p className="text-[11px] text-slate-400">Security Command Center</p>
              </div>
            </div>

            {/* Runtime Status Pill */}
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-[11px]">
              <span
                className={`size-2 shrink-0 rounded-full ${
                  telemetryAvailable
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                }`}
              />
              <span className="truncate text-slate-400">
                {telemetryAvailable ? 'Payload Cloud Engine Live' : 'Payload Local Dev Engine'}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Operations
            </p>
            <div className="mt-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                    item.active
                      ? 'bg-amber-400/10 font-semibold text-amber-300'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      name={item.icon as any}
                      className={`size-4 transition ${
                        item.active ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        item.highlightBadge
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'bg-white/5 text-slate-400 border border-white/5'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* Admin Footer & Logout */}
        <div className="space-y-4 border-t border-white/[0.08] pt-6">
          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-400/10 font-bold text-amber-300 text-xs">
              {admin.email.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{admin.email}</p>
              <p className="text-[10px] text-amber-400/90 font-medium">Administrator (Admins)</p>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="flex w-full items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-60"
            >
              <span>{isPending ? 'Signing out…' : 'Sign Out Admin'}</span>
              <Icon name="lock" className="size-3.5" />
            </button>

            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-center text-xs text-slate-400 hover:text-white"
            >
              <span>Switch to Learner Portal</span>
              <Icon name="arrow" className="size-3" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#071322]/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid size-9 place-items-center rounded-xl border border-white/10 text-slate-400 lg:hidden hover:text-white"
              aria-label="Toggle navigation drawer"
            >
              <Icon name={mobileMenuOpen ? 'x' : 'menu'} className="size-4" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Administration Portal
              </p>
              <h1 className="text-sm font-bold text-white md:text-base">
                Security Architecture Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 sm:inline-flex">
              <span className="size-2 rounded-full bg-emerald-400" />
              RBAC: Admins Collection
            </span>

            <button
              onClick={handleLogout}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10 lg:hidden"
            >
              <Icon name="lock" className="size-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-white/10 bg-[#071322] p-5 lg:hidden">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium ${
                    item.active
                      ? 'bg-amber-400/10 text-amber-300'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name={item.icon as any} className="size-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
            <div className="mt-4 border-t border-white/10 pt-4">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Switch to Learner Portal <Icon name="arrow" className="size-3" />
              </Link>
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">{children}</main>
      </div>
    </div>
  )
}
