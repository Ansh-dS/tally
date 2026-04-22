// services/createCookies.ts
import { cookies } from 'next/headers'

/**
 * Set an httpOnly access token cookie in server context (server action / server component).
 * Throws an Error if setting the cookie fails so callers can handle it.
 */
export async function accessTokenCookie(jwtToken: string): Promise<string> {
  try {
    if (!jwtToken) throw new Error('accessTokenCookie: jwtToken is required')

    const cookieStore = await cookies()
    cookieStore.set({
      name: 'jwtAccessToken',
      value: jwtToken,
      httpOnly: true, // JS can't read the cookies
      path: '/',
      secure: process.env.NODE_ENV === 'production', // ensure cookies are sent over HTTPS.
      sameSite: 'lax', // reduces CSRF risk but keeps usability.
      maxAge: 15 * 60, // otherwise browser deletes it after
    })

    return 'Cookie has been created'
  } catch (err) {
    // Log helpful debug info and rethrow so caller can decide what to do
    console.error('accessTokenCookie - failed to set cookie:', {
      message: (err as Error).message,
      stack: (err as Error).stack,
    })
    throw new Error('Failed to set access token cookie')
  }
}

/**
 * Set an httpOnly refresh token cookie in server context (server action / server component).
 * Throws an Error if setting the cookie fails so callers can handle it.
 */
export async function refreshTokenCookie(jwtToken: string): Promise<string> {
  try {
    if (!jwtToken) throw new Error('refreshTokenCookie: jwtToken is required')

    const cookieStore = await cookies()
    cookieStore.set({
      name: 'jwtRefreshToken',
      value: jwtToken,
      httpOnly: true, // JS can't read the cookies
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // reduces CSRF risk but keeps usability.
      maxAge: 7 * 24 * 60 * 60,
    })

    return 'Cookie has been created'
  } catch (err) {
    console.error('refreshTokenCookie - failed to set cookie:', {
      message: (err as Error).message,
      stack: (err as Error).stack,
    })
    throw new Error('Failed to set refresh token cookie')
  }
}

/**
 * Read a cookie value from the server cookie store.
 * Returns the cookie value or null. On internal error also returns null and logs the error.
 */
export async function getAuthToken(
  name: 'jwtRefreshToken' | 'jwtAccessToken'
): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(name)

    if (!token) return null
    return token.value
  } catch (err) {
    // Log the error but stay quiet to the caller
    console.error(
      `[CookieStore] Failed to read ${name}:`,
      (err as Error).message
    )

    // return null to keep the original contract (caller treats missing token as not-logged-in)
    return null
  }
}
// these are http-only-cookie.
