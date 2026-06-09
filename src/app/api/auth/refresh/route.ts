import { NextRequest, NextResponse } from 'next/server'
import { tryRefreshToken } from '@auth/session'

/*
why do we need the file: 
    1. we are creating this because we can't update, delete ... but only read the cookies. 
    2. this means we can't use server actions we only can use API.
    3. we are taking a path and once we re-create the cookies we move back to the path.
*/
export async function GET(request: NextRequest) {
  /* 
        1. Find out where the user was trying to go.
        2. if not going anywhere then send to '/froms'. 
    */
  console.log("reached refreshed URL")
  const searchParams = request.nextUrl.searchParams
  const callbackUrl = searchParams.get('callbackUrl') || '/forms'

  // Ensure we are redirecting to an absolute path on our own domain
  // request.nextUrl.origin gets 'http://localhost:3000' automatically
  const origin = request.nextUrl.origin

  // We strictly ensure callbackUrl starts with a /
  const safeCallback = callbackUrl.startsWith('/')
    ? callbackUrl
    : `/${callbackUrl}`
  const finalTarget = new URL(safeCallback, origin)

  const refreshRes = await tryRefreshToken(safeCallback)
  console.log("after try refrsh token",refreshRes )
  if (refreshRes.status === 'success') {
    // This will redirect to http://localhost:3000/forms
    // instead of http://localhost:3000/api/auth/forms
    console.log("success at tryRefreshToken:", finalTarget )
    return NextResponse.redirect(finalTarget)
  }

  // If refresh fails, go to login
  const loginUrl = new URL('/login', origin)
  loginUrl.searchParams.set('callbackUrl', safeCallback)
  return NextResponse.redirect(loginUrl)
}
