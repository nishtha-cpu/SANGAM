import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import config from '@payload-config'
import { getPayload } from 'payload'
import { APP_SESSION_COOKIE } from '@/backend/auth/app-auth'
import { findOrCreateGoogleDevUser, signDevToken } from '@/backend/auth/dev-auth'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    req.nextUrl.origin ||
    'http://localhost:3000'

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=oauth_${encodeURIComponent(error)}`, baseUrl)
    )
  }

  const cookieStore = await cookies()
  const savedState = cookieStore.get('google_oauth_state')?.value

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(
      new URL('/login?error=invalid_oauth_state', baseUrl)
    )
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/login?oauth=unconfigured', baseUrl)
    )
  }

  const redirectUri = `${baseUrl}/api/auth/google/callback`

  try {
    // 1. Exchange code for access & ID tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text()
      console.error('[Google OAuth] Token exchange error:', errText)
      return NextResponse.redirect(
        new URL('/login?error=oauth_token_exchange_failed', baseUrl)
      )
    }

    const tokenData = await tokenResponse.json()

    // 2. Fetch authenticated profile from Google UserInfo endpoint
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    )

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(
        new URL('/login?error=oauth_profile_fetch_failed', baseUrl)
      )
    }

    const googleUser = await userInfoResponse.json()
    const email = (googleUser.email || '').toLowerCase().trim()
    const name = googleUser.name || email.split('@')[0] || 'Learner'
    const googleId = googleUser.sub

    if (!email || !googleUser.email_verified) {
      return NextResponse.redirect(
        new URL('/login?error=unverified_google_email', baseUrl)
      )
    }

    // 3. Authenticate or create user in Payload CMS / local auth store
    let sessionToken: string | null = null

    try {
      const payload = await getPayload({ config })

      // Check if user already exists
      const existing = await payload.find({
        collection: 'users',
        where: { email: { equals: email } },
        limit: 1,
        overrideAccess: true,
      })

      let userId: string | number
      if (existing.docs.length > 0) {
        userId = existing.docs[0].id
      } else {
        const created = await (payload as any).create({
          collection: 'users',
          data: {
            name,
            email,
            emailVerified: true,
            termsAcceptedAt: new Date().toISOString(),
            googleId,
          },
          overrideAccess: true,
        })
        userId = created.id
      }

      // Generate secure session token
      sessionToken = signDevToken({
        id: String(userId),
        email,
        name,
        role: 'learner',
        collection: 'users',
      })
    } catch {
      // Local development fallback
      const devRes = findOrCreateGoogleDevUser({
        googleId,
        email,
        name,
      })
      sessionToken = signDevToken(devRes.user)
    }

    if (!sessionToken) {
      return NextResponse.redirect(
        new URL('/login?error=session_creation_failed', baseUrl)
      )
    }

    // 4. Issue session cookie and clean up state
    const response = NextResponse.redirect(new URL('/', baseUrl))

    response.cookies.set(APP_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    })

    response.cookies.delete('google_oauth_state')

    return response
  } catch (err: any) {
    console.error('[Google OAuth] Exception in callback:', err)
    return NextResponse.redirect(
      new URL('/login?error=oauth_internal_error', baseUrl)
    )
  }
}
