'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageFrame } from '@frontend/layouts/PageFrame'
import { Logo } from '@frontend/components/Logo'
import { Icon } from '@frontend/components/icons'
import { useAuthForm } from '@frontend/hooks/useAuthForm'

export interface AuthViewProps {
  signup?: boolean
  forgot?: boolean
  reset?: boolean
}

export function AuthView({
  signup = false,
  forgot = false,
  reset = false,
}: AuthViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const oauthNotice = searchParams.get('oauth')
  const oauthError = searchParams.get('error')
  const { state, isPending, formAction, showPassword, toggleShowPassword } = useAuthForm({ signup })

  if (forgot || reset) {
    return (
      <PageFrame>
        <div className="mx-auto max-w-md card p-7 md:p-9">
          <span className="grid size-12 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <Icon name="lock" className="size-5" />
          </span>
          <h1 className="mt-6 text-2xl font-semibold">
            {reset ? 'Create new password' : 'Reset your password'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {reset
              ? 'Choose a strong password you have not used before.'
              : 'Enter your registered email and we will send a secure reset link.'}
          </p>
          <form
            className="mt-7 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              router.push(reset ? '/login' : '/forgot-password/reset')
            }}
          >
            {reset ? (
              <>
                <label className="field">
                  New password
                  <input className="input" type="password" required />
                </label>
                <label className="field">
                  Confirm password
                  <input className="input" type="password" required />
                </label>
              </>
            ) : (
              <label className="field">
                Email address
                <input className="input" type="email" required />
              </label>
            )}
            <button className="button-primary w-full justify-center">
              {reset ? 'Update password' : 'Send reset link'}
            </button>
          </form>
        </div>
      </PageFrame>
    )
  }

  return (
    <PageFrame>
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0a1726] shadow-2xl lg:grid-cols-[1fr_1.04fr]">
        <div className="relative hidden min-h-[620px] overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(52,211,153,.22),transparent_35%),linear-gradient(145deg,#0b2135,#06101c)]" />
          <div className="hero-grid absolute inset-0 opacity-60" />
          <Logo />
          <div className="relative">
            <p className="eyebrow">Build secure by design</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight">
              Practice architecture.
              <br />
              Prove your thinking.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
              Hands-on learning, scenario assessments and guided design reviews in one focused
              workspace.
            </p>
          </div>
        </div>
        <div className="p-7 md:p-10">
          <p className="eyebrow">{signup ? 'Create your account' : 'Welcome back'}</p>
          <h1 className="mt-3 text-3xl font-semibold">
            {signup ? 'Start learning today' : 'Sign in to SANGAM'}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {signup ? 'Already have an account?' : 'New to the platform?'}{' '}
            <Link className="text-emerald-300 hover:underline" href={signup ? '/login' : '/signup'}>
              {signup ? 'Login' : 'Create an account'}
            </Link>
          </p>
          <form action={formAction} className="mt-7 space-y-4">
            {signup && (
              <label className="field">
                Full name
                <input
                  name="name"
                  className={`input ${state.fieldErrors?.name ? 'input-error' : ''}`}
                  placeholder="Alex Rivera"
                />
                <small>{state.fieldErrors?.name}</small>
              </label>
            )}
            <label className="field">
              Email address
              <input
                name="email"
                className={`input ${state.fieldErrors?.email ? 'input-error' : ''}`}
                type="email"
                placeholder="alex@example.com"
              />
              <small>{state.fieldErrors?.email}</small>
            </label>
            <label className="field">
              Password
              <div className="relative">
                <input
                  name="password"
                  className={`input pr-12 ${state.fieldErrors?.password ? 'input-error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={signup ? 'Min 8 chars, upper, lower, number' : 'At least 8 characters'}
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  aria-label="Show password"
                >
                  <Icon name="eye" className="size-4" />
                </button>
              </div>
              <small>{state.fieldErrors?.password}</small>
            </label>
            {signup && (
              <label className="field">
                Confirm password
                <input
                  name="confirmPassword"
                  className={`input ${state.fieldErrors?.confirmPassword ? 'input-error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                />
                <small>{state.fieldErrors?.confirmPassword}</small>
              </label>
            )}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2">
                  <input
                    name={signup ? 'terms' : 'remember'}
                    type="checkbox"
                    className="accent-emerald-400"
                  />
                  {signup ? 'I accept the Terms and Conditions' : 'Remember me'}
                </label>
                {!signup && (
                  <Link href="/forgot-password" className="text-emerald-300">
                    Forgot password?
                  </Link>
                )}
              </div>
              {signup && state.fieldErrors?.terms && (
                <small className="text-rose-400">{state.fieldErrors.terms}</small>
              )}
            </div>
            {oauthNotice === 'unconfigured' && (
              <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-3.5 text-xs text-amber-200">
                <p className="font-semibold text-amber-300">Google OAuth Configuration Notice</p>
                <p className="mt-1 leading-relaxed text-amber-200/90">
                  Google Sign-In integration is wired. To connect live Google authentication, configure <code className="bg-black/30 px-1 py-0.5 rounded text-white">GOOGLE_CLIENT_ID</code> and <code className="bg-black/30 px-1 py-0.5 rounded text-white">GOOGLE_CLIENT_SECRET</code> with authorized redirect URI <code className="bg-black/30 px-1 py-0.5 rounded text-white">/api/auth/google/callback</code>.
                </p>
              </div>
            )}
            {oauthError && (
              <div className="rounded-xl border border-rose-400/25 bg-rose-400/10 p-3.5 text-xs text-rose-200">
                Google authentication could not be completed ({oauthError.replace('oauth_', '')}). Please sign in with email/password.
              </div>
            )}
            {state.message && (
              <div
                className={`rounded-xl border px-4 py-3 text-xs ${
                  state.ok
                    ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-200'
                    : 'border-rose-400/25 bg-rose-400/8 text-rose-200'
                }`}
              >
                {state.ok ? 'Redirecting to home…' : state.message}
              </div>
            )}
            <button
              disabled={isPending}
              className="button-primary w-full justify-center disabled:opacity-60"
            >
              {isPending ? 'Please wait…' : signup ? 'Sign Up' : 'Login'}
            </button>
          </form>
          <div className="my-5 flex items-center gap-3 text-[11px] text-slate-600 before:h-px before:flex-1 before:bg-white/8 after:h-px after:flex-1 after:bg-white/8">
            OR
          </div>
          <a
            href="/api/auth/google"
            className="button-secondary w-full justify-center transition-all hover:border-emerald-400/30 hover:bg-white/5"
            title="Continue with Google"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="font-medium text-white">Continue with Google</span>
          </a>
        </div>
      </div>
    </PageFrame>
  )
}
