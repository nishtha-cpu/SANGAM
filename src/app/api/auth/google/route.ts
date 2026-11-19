import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    req.nextUrl.origin ||
    'http://localhost:3000'

  if (!clientId || !clientSecret) {
    // Graceful unconfigured notice redirect with setup guide
    return NextResponse.redirect(
      new URL('/login?oauth=unconfigured', baseUrl)
    )
  }

  // Generate cryptographically random state for CSRF protection
  const state = crypto.randomBytes(32).toString('hex')

  const cookieStore = await cookies()
  cookieStore.set('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  })

  const redirectUri = `${baseUrl}/api/auth/google/callback`

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.set('client_id', clientId)
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', 'openid email profile')
  googleAuthUrl.searchParams.set('state', state)
  googleAuthUrl.searchParams.set('prompt', 'select_account')

  return NextResponse.redirect(googleAuthUrl.toString())
}
