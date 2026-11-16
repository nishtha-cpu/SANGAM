'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
      router.push('/login')
    })
  }

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
        <nav className="hidden items-center gap-7 text-sm text-slate-300 lg:flex">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/plans">Plans</Link>
          <Link href="/recorded-classes">Recorded Classes</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/settings" className="icon-button" aria-label="Settings">
            <Icon name="settings" className="size-5" />
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenu(!menu)}
              className="ml-1 grid size-10 place-items-center rounded-full bg-gradient-to-br from-emerald-300 to-cyan-500 text-sm font-bold text-[#04111d]"
              aria-label="Open profile menu"
            >
              {initials}
            </button>
            {menu && (
              <div className="absolute right-0 top-13 w-56 rounded-2xl border border-white/10 bg-[#0c1a2a] p-2 shadow-2xl">
                <div className="border-b border-white/8 px-3 py-3">
                  <p className="text-sm font-semibold text-white">{displayName}</p>
                  <p className="text-xs text-slate-400">
                    {currentUser?.email || 'Security learner'}
                  </p>
                </div>
                {[
                  ['My Profile', '/profile'],
                  ['Account Settings', '/settings'],
                  ['My Packages', '/plans'],
                  ['My Learning', '/dashboard'],
                ].map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    className="block rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    {label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-rose-300 hover:bg-rose-400/10 disabled:opacity-60"
                >
                  {loggingOut ? 'Signing out…' : 'Logout'}
                </button>
              </div>
            )}
          </div>
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
      {mobile && (
        <nav className="border-t border-white/8 px-5 py-4 lg:hidden">
          {[
            ['Home', '/'],
            ['Dashboard', '/dashboard'],
            ['Plans', '/plans'],
            ['Recorded Classes', '/recorded-classes'],
          ].map(([a, b]) => (
            <Link key={a} href={b} className="block py-2.5 text-sm text-slate-300">
              {a}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
