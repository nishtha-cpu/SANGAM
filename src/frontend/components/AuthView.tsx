'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
            {state.message && (
              <div
                className={`rounded-xl border px-4 py-3 text-xs ${
                  state.ok
                    ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-200'
                    : 'border-rose-400/25 bg-rose-400/8 text-rose-200'
                }`}
              >
                {state.ok ? 'Redirecting to your dashboard…' : state.message}
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
          <button
            type="button"
            disabled
            className="button-secondary w-full justify-center opacity-60"
            title="Google credentials are not configured"
          >
            <span className="font-bold">G</span> Continue with Google{' '}
            <span className="ml-auto text-[10px] text-slate-500">Unavailable</span>
          </button>
        </div>
      </div>
    </PageFrame>
  )
}
