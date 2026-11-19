'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction, signupAction, type AuthState } from '@/backend/actions/auth-actions'

const initialAuth: AuthState = { ok: false, message: '' }

export function useAuthForm({ signup = false }: { signup?: boolean } = {}) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, initialAuth)
  const [signupState, signupFormAction, signupPending] = useActionState(signupAction, initialAuth)

  const state = signup ? signupState : loginState
  const isPending = signup ? signupPending : loginPending
  const formAction = signup ? signupFormAction : loginFormAction

  useEffect(() => {
    if (state.ok) {
      router.push('/')
    }
  }, [state.ok, router])

  return {
    state,
    isPending,
    formAction,
    showPassword,
    toggleShowPassword: () => setShowPassword((prev) => !prev),
  }
}
