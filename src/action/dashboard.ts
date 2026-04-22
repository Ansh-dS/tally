'use server'

import { redirect } from 'next/navigation'
import { protectApiRoute } from '@auth/authorization'
import { cookies } from 'next/headers'
import { prismaClient } from '@db/client'

/*
    using isAuthenticate:
        we get the user data after checking the userId in database. 
        otherwise we redirect to the login. 
*/

export interface AuthorizedUser {
  id: string
  email: string
  firstName: string | null
}

/**
 * Enforces authentication on a Server Component or Action.
 * Step 1: Validates the current session using the protectApiRoute brain.
 * Step 2: If the access token is dead but a refresh is possible, redirects to the refresh handler.
 * Step 3: If no valid session exists, redirects to the login page with a callback URL.
 * Output: Returns the verified AuthorizedUser object or triggers a server-side redirect.
 */
export async function getAuthorizedUser(
  currentPath: string
): Promise<AuthorizedUser> {
  const auth = await protectApiRoute(currentPath)

  /* 1. encodeURIComponent: it ecodes the params(key-value pair) correctly.

        2.  before: "/forms/report?section=analytics&sort=asc";
            after: https://example.com/login?callbackUrl=%2Fforms%2Freport%3Fsection%3Danalytics%26sort%3Dasc

        3. in login or other page we first need to decode the path using 'decodeURIComponent.
    */

  // Refresh path: cookie mutation must happen in a Route Handler.
  if (auth.status === 'error') {
    redirect(`/api/auth/refresh?callbackUrl=${encodeURIComponent(currentPath)}`)
  }

  if (auth.status === 'failed') {
    redirect(`/login?callbackUrl=${encodeURIComponent(currentPath)}`)
  }

  // Return the verified user so the page can use it
  const user = auth.data as AuthorizedUser
  return user
}

/**
 * Terminates the user session and cleans up all security artifacts.
 * Step 1: Verifies the user's identity before allowing logout (prevents CSRF logouts).
 * Step 2: Deletes the JWT cookies from the browser.
 * Step 3: Wipes all session records from the database for this specific user.
 * Output: Redirects the user to the login page.
 */
export async function logout(currentPath = '/dashboard') {
  const auth = await protectApiRoute(currentPath)

  if (auth.status === 'failed' || auth.status === 'error') {
    redirect(`/login?callbackUrl=${encodeURIComponent(currentPath)}`)
  }

  const user = auth.data as AuthorizedUser
  const cookieStore = await cookies()

  cookieStore.delete('jwtAccessToken')
  cookieStore.delete('jwtRefreshToken')

  /*
        1. currently we are deleting all the sessions oppned on every-device
        2. but using session Id we can logout form each session in-dependendently. 
    */
  try {
    await prismaClient.session.deleteMany({
      where: {
        userId: user.id,
      },
    })
  } catch (err) {
    /* We don't return handleQueryError here because:
                "logged out" in their browser. We just want them gone.*/
    console.error('Database failed to clear sessions:', err)
  }
  redirect('/login')
}
