'use server'

import { redirect } from 'next/navigation'
import { isAuthenticated } from '@auth/service'
import { cookies } from 'next/headers'
import { prismaClient } from '@db/client'
/*
    using isAuthenticate:
        we get the user data after checking the userId in database. 
        otherwise we redirect to the login. 
*/

export interface requireUserOutput {
  id: string
  email: string
  firstName: string | null
}

/* 
1. cheking weather the userId is correct or not using 'isAuthenticated' 
2. once we authenticate the user redirect the path. 
*/

export async function requireUser(
  currentPath: string
): Promise<requireUserOutput> {
  const auth = await isAuthenticated(currentPath)
  console.log('hi i am isAuthenticated')
  /* 
        1. encodeURIComponent: it ecodes the params(key-value pair) correctly.

        2.  before: "/forms/report?section=analytics&sort=asc";
            after: https://example.com/login?callbackUrl=%2Fforms%2Freport%3Fsection%3Danalytics%26sort%3Dasc

        3. in login or other page we first need to decode the path using 'decodeURIComponent.
    */

  // 1. The Intercept: If the token expired, bounce them to the API route
  if (auth.status === 'error' && auth.error === 'refresh_required') {
    console.log('hi i am require user', currentPath)
    redirect(`/api/auth/refresh?callbackUrl=${encodeURIComponent(currentPath)}`)
  }

  // 2. The Hard Fail: No valid tokens at all, send to login
  if (auth.status === 'failed') {
    redirect(`/login?callbackUrl=${encodeURIComponent(currentPath)}`)
  }

  // Return the verified user so the page can use it
  const user = auth.data as requireUserOutput
  return user
}

export async function logout(userId: string) {
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
        userId,
      },
    })
  } catch (err) {
    /* We don't return handleQueryError here because:
                "logged out" in their browser. We just want them gone.*/
    console.error('Database failed to clear sessions:', err)
  }
  redirect('/login')
}

