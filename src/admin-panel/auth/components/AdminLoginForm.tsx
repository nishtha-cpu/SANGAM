'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { adminLoginAction, type AdminAuthState } from '../admin-actions'
import { Icon } from '@/app/(frontend)/components/icons'

const initialAuth: AdminAuthState = { ok: false, message: '' }

interface AdminLoginFormProps {
  currentLearnerEmail?: string | null
}

export function AdminLoginForm({ currentLearnerEmail }: AdminLoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction, isPending] = useActionState(adminLoginAction, initialAuth)

  const isLearnerDenied = searchParams.get('error') === 'learner_denied'

  useEffect(() => {
    if (state.ok) {
      router.push('/admin-dashboard')
    }
  }, [state.ok, router])

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Access Denied / Learner Detected Warning */}
      {isLearnerDenied && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200 shadow-lg">
          <div className="flex items-start gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-amber-500/20 text-amber-300">
              !
            </span>
            <div>
              <p className="font-semibold text-amber-100">Administrative Access Denied</p>
              <p className="mt-1 text-xs leading-5 text-amber-300/80">
                You attempted to access a protected administrator route. Learner accounts are strictly
                restricted from administrative operations.
              </p>
            </div>
          </div>
        </div>
      )}

      {currentLearnerEmail && !isLearnerDenied && (
        <div className="mb-6 rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-xs text-sky-200">
          <p className="font-medium text-sky-100">Learner Session Detected</p>
          <p className="mt-1 text-sky-300/80">
            Currently signed in as learner <strong className="text-white">{currentLearnerEmail}</strong>.
            To access the admin portal, please sign in with an administrator account.
          </p>
          <div className="mt-2.5">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 font-semibold text-sky-300 hover:underline"
            >
              Return to Learner Dashboard <Icon name="arrow" className="size-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Login Card */}
      <div className="card overflow-hidden p-8 shadow-2xl md:p-10">
        <div className="flex items-center justify-between">
          <div className="grid size-12 place-items-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.15)]">
            <Icon name="shield" className="size-6" />
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Admin Auth
          </span>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            SANGAM Security Operations
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
            Administrator Portal
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            Authorized personnel only. Authenticates strictly against the secure Admins collection.
          </p>
        </div>

        <form action={formAction} className="mt-7 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Admin Email
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@sangam.internal"
                className={`mt-1.5 w-full rounded-xl border bg-black/40 px-4 py-3 text-sm text-white placeholder-slate-500 transition focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                  state.fieldErrors?.email ? 'border-rose-500/60' : 'border-white/10'
                }`}
              />
            </label>
            {state.fieldErrors?.email && (
              <p className="mt-1 text-xs text-rose-400">{state.fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">
              Admin Password
              <div className="relative mt-1.5">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className={`w-full rounded-xl border bg-black/40 px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 transition focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                    state.fieldErrors?.password ? 'border-rose-500/60' : 'border-white/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                  aria-label="Toggle password visibility"
                >
                  <Icon name="eye" className="size-4" />
                </button>
              </div>
            </label>
            {state.fieldErrors?.password && (
              <p className="mt-1 text-xs text-rose-400">{state.fieldErrors.password}</p>
            )}
          </div>

          {state.message && (
            <div
              className={`rounded-xl border p-3.5 text-xs leading-relaxed ${
                state.ok
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
              }`}
            >
              {state.ok ? 'Authentication verified. Redirecting to admin console…' : state.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_8px_30px_rgba(251,191,36,0.15)] transition duration-200 hover:-translate-y-0.5 hover:from-amber-300 hover:to-amber-200 disabled:opacity-60"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="size-3.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                Verifying Credentials…
              </span>
            ) : (
              <>
                <Icon name="lock" className="size-4" />
                Sign In to Admin Portal
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-white/5 pt-5 text-center">
          <Link
            href="/login"
            className="text-xs text-slate-400 transition hover:text-white"
          >
            ← Back to Learner Sign In
          </Link>
        </div>
      </div>

      {/* Security Architecture Footnote */}
      <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center text-[11px] leading-5 text-slate-500">
        <p>
          <strong className="text-slate-400">Strict RBAC Isolation:</strong> Learner accounts from the{' '}
          <code className="text-slate-400">users</code> collection are cryptographically segregated and
          cannot authenticate against the <code className="text-slate-400">admins</code> collection.
        </p>
      </div>
    </div>
  )
}
