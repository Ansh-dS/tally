import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/*
    use 'redirect' here over 'useRouter':
        middleware run's on 'server'.
        whereas:
            useRouter: runs on client
            but:
                redirect runs on server. 
*/

/*
    1. checks, do we have access token or refresh token when we are trying to access some specific pages.  
            if not:
                then redirect
            

    2. middleware is a API not server function.
*/
export async function proxy(request: NextRequest) {
  // In proxy/middleware, always read cookies from the incoming request.
  const accessToken = request.cookies.get('jwtAccessToken')?.value
  const refreshToken = request.cookies.get('jwtRefreshToken')?.value

  /* a. Defining which paths shouldn't be accessed without access token.
        b. request.nextUrl.pathname: fetches the path over whole url also exclude params.
                https://example.com/products/123?ref=homepage =>  products/123. 
    */
  console.log('hi i am middleware')
  const pathname = request.nextUrl.pathname
  const pagesPath =
    pathname.startsWith('/forms') || pathname.startsWith('/analytics')

  /* Conditional Redirection */
  // Require refresh token for protected routes.
  // If access token is missing but refresh exists, allow the route so server auth can trigger refresh flow.
  if (pagesPath && !refreshToken) {
    /* a. request.url: the absolute url the user want to access, https://example.com/xyz/do/don't
            b. new URL(): fetches base url form 'request.url' then add 'path:./login' at the last. 
        */
    const loginUrl = new URL('/login', request.url)
    console.log('hi i am middleware: inside condition')
    /* a. attaches the params(key-val pair) at the end of above URL.
            b. at the login page developer takes up the path and add up with base url to come to the corret page which they trying to access before.
        */
    loginUrl.searchParams.set('callbackUrl', pathname)

    return NextResponse.redirect(loginUrl)
  }
  console.log('hi i am middleware: outside condition')

  // moving to the next step (either another middleware or the actual page)
  return NextResponse.next()
}

// Only run this on specific routes/files.
export const config = {
  matcher: ['/forms/:path*', '/analytics/:path*'],
}
