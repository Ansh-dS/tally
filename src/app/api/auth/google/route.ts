/**
 * GET /api/auth/google
 *
 * Step 1 of the Google OAuth flow — initiates the authorization request.
 *
 * - Builds a signed Google authorization URL with scopes: openid, email, profile
 * - Generates a random nonce and encodes it + the callbackUrl into the `state` param
 * - Stores the nonce in a short-lived HttpOnly cookie (`oauth_state`) for CSRF validation
 * - Redirects the browser to Google's consent screen
 */

import { NextRequest, NextResponse } from 'next/server'
import { buildGoogleAuthUrl } from '@/lib/auth/google'

export async function GET(request: NextRequest) {
  // Preserve the callbackUrl so we can return the user to their original destination.
  const callbackUrl =
    request.nextUrl.searchParams.get('callbackUrl') || '/forms'

  // Sanitise: only allow internal paths.
  const safeCallback =
    callbackUrl.startsWith('/') &&
    !callbackUrl.startsWith('//') &&
    !callbackUrl.startsWith('/http')
      ? callbackUrl
      : '/forms'

  try {
    const { url, nonce } = buildGoogleAuthUrl(safeCallback)

    const response = NextResponse.redirect(url)

    // Store the nonce in a short-lived HttpOnly cookie so the callback can
    // verify `state` and prevent CSRF attacks.
    response.cookies.set('oauth_state', nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutes — just long enough to complete the handshake
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[/api/auth/google] Failed to build authorization URL:', err)
    // Fail safely — redirect to login so the user isn't stuck on a blank screen.
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
