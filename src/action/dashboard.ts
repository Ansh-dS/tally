'use server'

import { redirect } from 'next/navigation'
import { protectApiRoute } from '@auth/authorization'
import { cookies, headers } from 'next/headers'
import { prismaClient } from '@db/client'

// Verify user is authenticated.
export interface AuthorizedUser {
  id: string
  email: string
  firstName?: string | null
}

// Verify and return authenticated user.
export async function getAuthorizedUser(
  currentPath: string
): Promise<AuthorizedUser> {
  const auth = await protectApiRoute(currentPath)

  /* 1. encodeURIComponent: it ecodes the params(key-value pair) correctly.

        2.  before: "/forms/report?section=analytics&sort=asc";
            after: https://example.com/login?callbackUrl=%2Fforms%2Freport%3Fsection%3Danalytics%26sort%3Dasc

        3. in login or other page we first need to decode the path using 'decodeURIComponent.
    */
  // Refresh tokens via Route Handler (mutates cookies).
  if (auth.status === 'error') {
    redirect(`/api/auth/refresh?callbackUrl=${encodeURIComponent(currentPath)}`)
  }

  if (auth.status === 'failed') {
    redirect(`/login?callbackUrl=${encodeURIComponent(currentPath)}`)
  }

  // Type-safe after auth checks above.
  const user = auth.data as AuthorizedUser
  return user
}

// Logout user and clear all sessions.
export async function logout(currentPath: string) {
  const auth = await protectApiRoute(currentPath)

  if (auth.status === 'failed' || auth.status === 'error') {
    redirect(`/login?callbackUrl=${encodeURIComponent(currentPath)}`)
  }

  const user = auth.data as AuthorizedUser
  const cookieStore = await cookies()

  cookieStore.delete('jwtAccessToken')
  cookieStore.delete('jwtRefreshToken')

  // Delete all sessions for this user.
  try {
    await prismaClient.session.deleteMany({
      where: {
        userId: user.id,
      },
    })
  } catch (err) {
    // Continue logout even if session cleanup fails.
    console.error('Database failed to clear sessions:', err)
  }
  redirect('/login')
}
