/**
 * GET /api/auth/google/callback
 *
 * Step 2 of the Google OAuth flow — handles the authorization callback from Google.
 *
 * Pipeline (mirrors the email/password loginHandler exactly):
 *   1. Validate the `state` param against the `oauth_state` cookie (CSRF check)
 *   2. Exchange `code` for Google tokens and verify the id_token
 *   3. Upsert the user in our DB (create if new, find if returning)
 *   4. Generate our own jwtAccessToken + jwtRefreshToken
 *   5. Create a Session row in the DB (identical to loginHandler)
 *   6. Set jwtAccessToken + jwtRefreshToken HttpOnly cookies (same helpers)
 *   7. Clear the `oauth_state` cookie
 *   8. Redirect to the original callbackUrl
 *
 * After this handler completes, the browser state is IDENTICAL to having
 * just completed an email/password login — same two cookies, same Session row.
 * The middleware (proxy.ts) requires no changes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForUser, type OAuthStatePayload } from '@/lib/auth/google'
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt'
import { accessTokenCookie, refreshTokenCookie } from '@/lib/auth/cookies'
import { prismaClient } from '@/lib/db/client'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const origin = request.nextUrl.origin

  const code = searchParams.get('code')
  const state = searchParams.get('state')

  // ── 0. Basic param presence check ─────────────────────────────────────────
  if (!code || !state) {
    console.error('[google/callback] Missing code or state param')
    return NextResponse.redirect(new URL('/login?error=oauth_failed', origin))
  }

  // ── 1. CSRF validation — compare state nonce against oauth_state cookie ────
  const storedNonce = request.cookies.get('oauth_state')?.value

  let statePayload: OAuthStatePayload
  try {
    statePayload = JSON.parse(
      Buffer.from(state, 'base64url').toString('utf-8')
    ) as OAuthStatePayload
  } catch {
    console.error('[google/callback] Failed to decode state param')
    return NextResponse.redirect(new URL('/login?error=oauth_failed', origin))
  }

  if (!storedNonce || storedNonce !== statePayload.nonce) {
    console.error('[google/callback] CSRF nonce mismatch — possible attack')
    return NextResponse.redirect(new URL('/login?error=oauth_failed', origin))
  }

  // Decode the target path — sanitise to prevent open-redirect attacks.
  const rawCallbackUrl = statePayload.callbackUrl
  const safeCallback =
    typeof rawCallbackUrl === 'string' &&
    rawCallbackUrl.startsWith('/') &&
    !rawCallbackUrl.startsWith('//')
      ? rawCallbackUrl
      : '/forms'

  // ── 2. Exchange code → verified Google user identity ──────────────────────
  let googleUser: Awaited<ReturnType<typeof exchangeCodeForUser>>
  try {
    googleUser = await exchangeCodeForUser(code)
  } catch (err) {
    console.error(
      '[google/callback] Token exchange / id_token verification failed:',
      err
    )
    return NextResponse.redirect(new URL('/login?error=oauth_failed', origin))
  }

  // ── 3. Upsert the user in our database ────────────────────────────────────
  // Strategy: look up by email. If found, use the existing user (supports
  // account linking — Google login merges silently with existing email/password
  // accounts). If not found, create a new user without a password.
  let user: { id: string; email: string }
  try {
    const existing = await prismaClient.user.findUnique({
      where: { email: googleUser.email },
      select: { id: true, email: true },
    })

    if (existing) {
      user = existing

      // Opportunistically backfill avatar/name if the existing record is empty.
      await prismaClient.user.update({
        where: { id: existing.id },
        data: {
          ...(googleUser.firstName && { firstName: googleUser.firstName }),
          ...(googleUser.lastName && { lastName: googleUser.lastName }),
          ...(googleUser.avatar && { avatar: googleUser.avatar }),
        },
      })
    } else {
      // New user — no password (Google is the identity provider).
      user = await prismaClient.user.create({
        data: {
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          avatar: googleUser.avatar,
          password: null, // explicitly null — Google-only account
        },
        select: { id: true, email: true },
      })
    }
  } catch (err) {
    console.error('[google/callback] DB upsert failed:', err)
    return NextResponse.redirect(new URL('/login?error=oauth_failed', origin))
  }

  // ── 4. Generate our JWT pair (same functions as loginHandler) ─────────────
  const accessToken = generateAccessToken({
    email: user.email,
    userId: user.id,
  })
  const refreshToken = generateRefreshToken({ userId: user.id })

  // ── 5. Persist the session (identical to loginHandler) ────────────────────
  try {
    await prismaClient.session.create({
      data: {
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        user: { connect: { id: user.id } },
      },
    })
  } catch (err) {
    console.error('[google/callback] Session creation failed:', err)
    return NextResponse.redirect(new URL('/login?error=oauth_failed', origin))
  }

  // ── 6. Set the HttpOnly cookies (same helpers as loginHandler) ─────────────
  // Note: Next.js API route handlers must set cookies on the response object,
  // not via the `cookies()` helper (which is for server actions/components).
  // We replicate the same cookie attributes defined in cookies.ts.
  const finalRedirect = new URL(safeCallback, origin)
  const response = NextResponse.redirect(finalRedirect)

  const isProd = process.env.NODE_ENV === 'production'

  response.cookies.set('jwtAccessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes — matches accessTokenCookie()
    path: '/',
  })

  response.cookies.set('jwtRefreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days — matches refreshTokenCookie()
    path: '/',
  })

  // ── 7. Clear the CSRF nonce cookie ────────────────────────────────────────
  response.cookies.set('oauth_state', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}
