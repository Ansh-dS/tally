import { JwtPayload } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import resolveToken from '@auth/jwt'
import { getAuthToken } from '@auth/cookies'
import { prismaClient } from '@db/client'
import { accessTokenCookie } from '@auth/cookies'
import { generateAccessToken } from '@auth/jwt'
import {
  ApiResponse,
  failedResponse,
  successResponse,
} from '../utils/apiResponse'
import { handleQueryError } from '@db/query-error'
type AuthenticatedUser = {
  id: string
  email: string
  firstName: string | null
}

type AuthCheckResult =
  | { status: 'success'; data: AuthenticatedUser }
  | { status: 'error'; error: 'refresh_required' }
  | { status: 'failed'; error: 'no_tokens' | 'unauthorized' }

type RefreshResult =
  | { status: 'success'; data: { userId: string } }
  | {
      status: 'failed'
      error:
        | 'no_refresh_token'
        | 'invalid_refresh_token'
        | 'session_not_found'
        | 'user_not_found'
    }

interface sessionsData {
  id: string
  email: string
  firstName: string
}

// Validate tokens and database identity for authentication.
export async function validateSessionCore(
  path: string
): Promise<Partial<ApiResponse<sessionsData | unknown>>> {
  // Step 1: Retrieve the JWT Access Token from cookies.
  const accessToken = await getAuthToken('jwtAccessToken')

  if (!accessToken)
    return failedResponse({
      statusCode: 401,
      message: "Cant' find Access Token",
      path: path,
    })

  // Step 2: Cryptographically verify the token signature and expiration.
  const casesRes = resolveToken({
    token: accessToken,
    type: 'Access',
    path: path,
  })

  if (casesRes?.status === 'failed' || casesRes?.status === 'error')
    return casesRes

  try {
    // Step 3: Query the database to ensure the user still exists.
    // we can use redis to stop is db call each time a user asking data from a page.
    const user = await prismaClient.user.findUnique({
      where: {
        id: (casesRes.data as JwtPayload).userId,
      },
    })
    if (!user) {
      return failedResponse({
        statusCode: 404,
        message: 'No User found',
        path: path,
      })
    }
    return successResponse({
      statusCode: 200,
      message: 'Authorized',
      data: user,
    })
  } catch (err) {
    return handleQueryError(err, path)
  }
}

// Evaluate if user is authenticated and handle silent refresh state.
export async function validateSession(
  currentPath = '/forms'
): Promise<AuthCheckResult> {
  const path = currentPath || '/forms'

  // Step 1: Leverage the "Centralized Brain" for primary validation
  const session = await validateSessionCore(path)

  // Step 2: Handle Successful Authentication
  if (session.status === 'success' && session.data) {
    const userData = session.data as sessionsData
    return {
      status: 'success',
      data: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
      },
    }
  }

  // Step 3: Evaluation of the "Silent Refresh" state
  // We check for the Refresh Token if the Access Token validation failed or was missing
  const refreshToken = await getAuthToken('jwtRefreshToken')

  if (refreshToken) {
    // If the brain failed but a refresh token exists, we trigger the rotation logic
    return { status: 'error', error: 'refresh_required' }
  }

  // Step 4: Final Fallback for unauthenticated users
  // Differentiate between "Total lack of tokens" and "Invalid/Expired tokens"
  const isMissingToken = session.message === "Cant' find Access Token"

  return {
    status: 'failed',
    error: isMissingToken ? 'no_tokens' : 'unauthorized',
  }
}

async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('jwtAccessToken')
  cookieStore.delete('jwtRefreshToken')
}

async function deleteSessionByToken(token: string): Promise<void> {
  try {
    await prismaClient.session.deleteMany({
      where: { token },
    })
  } catch (err) {
    console.error('deleteSessionByToken failed:', err)
  }
}

// create an access token cilently using a valid Refresh Token.
export async function tryRefreshToken(
  currentPath = '/api/auth/refresh'
): Promise<RefreshResult> {
  // Step 1: Retrieve and verify the signature of the current Refresh token.
  const refreshToken = await getAuthToken('jwtRefreshToken')

  if (!refreshToken) {
    return { status: 'failed', error: 'no_refresh_token' }
  }

  const refreshRes = resolveToken({
    token: refreshToken,
    type: 'Refresh',
    path: currentPath,
  })

  if (refreshRes.status !== 'success' || !refreshRes.data) {
    await deleteSessionByToken(refreshToken)
    await clearAuthCookies()
    return { status: 'failed', error: 'invalid_refresh_token' }
  }

  const payload = refreshRes.data as JwtPayload
  const userId = payload.userId

  if (!userId || typeof userId !== 'string') {
    await clearAuthCookies()
    return { status: 'failed', error: 'invalid_refresh_token' }
  }

  try {
    // Step 2: Validate the token against the active sessions stored in the database.
    const session = await prismaClient.session.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    })

    if (!session) {
      // Can happen during concurrent refresh requests when another request
      // already rotated this token. Avoid clearing cookies here to prevent
      // clobbering a fresh Set-Cookie from the winning request.
      return { status: 'failed', error: 'session_not_found' }
    }

    if (session.userId !== userId) {
      await clearAuthCookies()
      return { status: 'failed', error: 'session_not_found' }
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await deleteSessionByToken(refreshToken)
      await clearAuthCookies()
      return { status: 'failed', error: 'session_not_found' }
    }

    if (!session.user) {
      await clearAuthCookies()
      return { status: 'failed', error: 'user_not_found' }
    }

    // Step 3: Generate a fresh Access token.
    const newAccessToken = generateAccessToken({
      userId: session.user.id,
      email: session.user.email,
    })

    // Step 4: Overwrite the user's access token cookie.
    await accessTokenCookie(newAccessToken)

    return { status: 'success', data: { userId: session.user.id } }
  } catch (err) {
    console.error('tryRefreshToken failed:', err)
    // Don't clear cookies on transient infra/db failures.
    // A concurrent refresh may already have rotated tokens successfully.
    return { status: 'failed', error: 'session_not_found' }
  }
}
