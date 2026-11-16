'use server'

/**
 * SANGAM — Compatibility Re-export Layer
 * Original: src/app/(frontend)/admin-actions.ts
 * Target:   src/admin-panel/auth/admin-actions.ts
 */
export {
  adminLoginAction,
  adminLogoutAction,
  type AdminAuthState,
} from '@/admin-panel/auth/admin-actions'
