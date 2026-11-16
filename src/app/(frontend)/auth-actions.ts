'use server'

/**
 * SANGAM — Compatibility Re-export Layer
 * Original: src/app/(frontend)/auth-actions.ts
 * Target:   src/backend/actions/auth-actions.ts
 */
export {
  loginAction,
  signupAction,
  logoutAction,
  requestPasswordResetAction,
  resetPasswordAction,
  verifyEmailTokenAction,
  updateProfileAction,
  deleteAccountAction,
  getSessionUserAction,
  type AuthState,
} from '@/backend/actions/auth-actions'
