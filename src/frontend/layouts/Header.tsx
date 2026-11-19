'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Icon } from '@frontend/components/icons'
import { Logo } from '@frontend/components/Logo'
import { logoutAction, getSessionUserAction } from '@/backend/actions/auth-actions'

export interface HeaderProps {
  inner?: boolean
  user?: {
    name?: string
    email?: string
  }
}

export function Header({ inner = false, user: initialUser }: HeaderProps) {
  const [currentUser, setCurrentUser] = useState(initialUser || null)
  const [menu, setMenu] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [loggingOut, startLogout] = useTransition()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser)
    } else {
      getSessionUserAction()
        .then((u) => {
          if (u) setCurrentUser(u)
        })
        .catch(() => {})
    }
  }, [initialUser])

  const displayName =
    currentUser?.name ||
    (currentUser?.email ? currentUser.email.split('@')[0] : 'Learner')

  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'L'

  function handleLogout() {
    setMenu(false)
    startLogout(async () => {
      await logoutAction()
      router.push('/')
      router.refresh()
    })
  }

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '/courses' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    ...(currentUser ? [{ label: 'Dashboard', href: '/dashboard' }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#06111f]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-[1320px] items-center justify-between px-5 lg:px-8">
        <div className="flex items-center gap-4">
          {inner && (
            <button
              type="button"
              onClick={() => history.back()}
              className="icon-button"
              aria-label="Go back"
            >
              <Icon name="back" className="size-5" />
            </button>
          )}
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 text-sm lg:flex">
          {navLinks.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative py-1 text-sm font-medium transition-all hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06111f] ${
                  active
                    ? 'font-semibold text-emerald-300 after:absolute after:bottom-[-22px] after:left-0 after:right-0 after:h-[2px] after:bg-emerald-400 after:shadow-[0_0_10px_rgba(52,211,153,0.6)]'
                    : 'text-slate-300'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Section: Auth vs Profile */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                href="/settings"
                className={`icon-button ${isActive('/settings') ? 'border-emerald-400/40 text-emerald-300' : ''}`}
                aria-label="Settings"
              >
                <Icon name="settings" className="size-5" />
              </Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenu(!menu)}
                  className="ml-1 grid size-10 place-items-center rounded-full bg-gradient-to-br from-emerald-300 to-cyan-500 text-sm font-bold text-[#04111d] shadow-sm transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-emerald-400"
                  aria-label="Open profile menu"
                >
                  {initials}
                </button>
                {menu && (
                  <div className="absolute right-0 top-13 z-50 w-56 rounded-2xl border border-white/10 bg-[#0c1a2a] p-2 shadow-2xl">
                    <div className="border-b border-white/8 px-3 py-3">
                      <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                      <p className="truncate text-xs text-slate-400">
                        {currentUser?.email || 'Security learner'}
                      </p>
                    </div>
                    {[
                      ['My Profile', '/profile'],
                      ['My Learning Dashboard', '/dashboard'],
                      ['My Packages & Plans', '/plans'],
                      ['Account Settings', '/settings'],
                    ].map(([label, href]) => (
                      <Link
                        key={label}
                        href={href}
                        onClick={() => setMenu(false)}
                        className={`block rounded-lg px-3 py-2 text-sm transition ${
                          isActive(href)
                            ? 'bg-emerald-400/10 font-medium text-emerald-300'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-300 transition hover:bg-rose-400/10 disabled:opacity-60"
                    >
                      {loggingOut ? 'Signing out…' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 transition hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="button-primary text-xs !px-4 !py-2"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobile(!mobile)}
            className="icon-button lg:hidden"
            aria-label="Toggle navigation"
          >
            <Icon name={mobile ? 'x' : 'menu'} className="size-5" />
          </button>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobile && (
        <nav className="border-t border-white/8 bg-[#071322] px-5 py-4 lg:hidden">
          <div className="space-y-1">
            {navLinks.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobile(false)}
                  className={`block rounded-xl px-3 py-2.5 text-sm transition ${
                    active
                      ? 'border-l-2 border-emerald-400 bg-emerald-400/10 font-semibold text-emerald-300'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {!currentUser && (
            <div className="mt-4 flex flex-col gap-2 border-t border-white/8 pt-4">
              <Link
                href="/login"
                onClick={() => setMobile(false)}
                className="button-secondary w-full justify-center text-xs"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobile(false)}
                className="button-primary w-full justify-center text-xs"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  )
}
