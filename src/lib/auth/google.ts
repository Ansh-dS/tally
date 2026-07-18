/**
 * lib/auth/google.ts
 *
 * Thin wrapper around the googleapis OAuth2Client.
 * Responsible for:
 *   1. Building the Google authorization URL (initiation step)
 *   2. Exchanging an auth `code` for a verified user identity (callback step)
 *
 * No framework coupling — plain async functions that can be called from any
 * Next.js API route handler.
 */

import { google } from 'googleapis'
import crypto from 'crypto'

// ── Config (validated at call time so we get a clear error if .env is missing) ──
function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      '[google.ts] Missing required env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI'
    )
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface GoogleUser {
  /** Google's unique identifier for the user — stable across name/email changes. */
  googleId: string
  email: string
  firstName: string | null
  lastName: string | null
  /** URL of the user's Google profile picture. */
  avatar: string | null
}

export interface OAuthStatePayload {
  /** Random nonce — compared against the `oauth_state` cookie to prevent CSRF. */
  nonce: string
  /** The page the user was trying to reach before being prompted to log in. */
  callbackUrl: string
}

// ── Step 1: Build the authorization URL ──────────────────────────────────────

/**
 * Builds the Google authorization URL and the nonce that must be stored in
 * the `oauth_state` HttpOnly cookie by the caller.
 *
 * @param callbackUrl  Path to redirect to after successful authentication.
 * @returns            `{ url, nonce }` — redirect to `url`, store `nonce` in cookie.
 */
export function buildGoogleAuthUrl(callbackUrl: string): {
  url: string
  nonce: string
} {
  const oauth2Client = getOAuth2Client()

  // Cryptographically random nonce for CSRF protection.
  const nonce = crypto.randomBytes(16).toString('hex')

  const state: OAuthStatePayload = { nonce, callbackUrl }
  const encodedState = Buffer.from(JSON.stringify(state)).toString('base64url')

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    state: encodedState,
    prompt: 'select_account', // always show the account chooser
  })

  return { url, nonce }
}

// ── Step 2: Exchange the auth code for a verified user identity ───────────────

/**
 * Exchanges a Google authorization `code` for a verified user identity.
 * Internally calls Google's token endpoint and verifies the id_token signature
 * using Google's public keys.
 *
 * @param code  The `code` query parameter from the OAuth callback.
 * @returns     Verified Google user info, or throws on failure.
 */
export async function exchangeCodeForUser(code: string): Promise<GoogleUser> {
  const oauth2Client = getOAuth2Client()

  // Exchange the code for tokens.
  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)

  if (!tokens.id_token) {
    throw new Error(
      '[google.ts] No id_token returned from Google token exchange'
    )
  }

  // Verify the id_token signature against Google's public keys.
  const ticket = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID!,
  })

  const payload = ticket.getPayload()

  if (!payload || !payload.sub || !payload.email) {
    throw new Error(
      '[google.ts] Invalid or incomplete id_token payload from Google'
    )
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    firstName: payload.given_name ?? null,
    lastName: payload.family_name ?? null,
    avatar: payload.picture ?? null,
  }
}
