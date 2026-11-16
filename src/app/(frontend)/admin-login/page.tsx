import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getAdminUser } from '@/admin-panel/auth/admin-auth'
import { getCurrentUser } from '@/backend/auth/app-auth'
import { AdminLoginForm } from '@/admin-panel/auth/components/AdminLoginForm'

export const metadata = {
  title: 'Administrator Login | SANGAM Operations',
  description: 'Authorized access to the SANGAM Security Operations administration console.',
}

export default async function AdminLoginPage() {
  // If already authenticated as an administrator, redirect immediately
  const admin = await getAdminUser()
  if (admin) {
    redirect('/admin-dashboard')
  }

  // Check if current visitor has a learner session
  const learner = await getCurrentUser()

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-96 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 right-1/4 size-80 rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>

      <Suspense fallback={<div className="text-center text-xs text-slate-500">Loading admin portal…</div>}>
        <AdminLoginForm currentLearnerEmail={learner?.email ?? null} />
      </Suspense>
    </main>
  )
}
