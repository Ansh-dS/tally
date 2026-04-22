import { JwtPayload } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import resolveToken from '@auth/jwt'
import { getAuthToken } from '@auth/cookies'
import { prismaClient } from '@db/client'
import { accessTokenCookie, refreshTokenCookie } from '@auth/cookies'
import { generateAccessToken, generateRefreshToken } from '@auth/jwt'
import {
  ApiResponse,
  failedResponse,
  successResponse,
} from '../utils/responses'
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

/**
 * Internal core function to validate tokens and database identity.
 * This is the "Single Source of Truth" for authentication logic.
 */
export async function validateSessionCore(
  path: string
): Promise<Partial<ApiResponse<sessionsData | unknown>>> {
  const accessToken = await getAuthToken('jwtAccessToken')

  if (!accessToken)
    return failedResponse({
      statusCode: 401,
      message: "Cant' find Access Token",
      path: path,
    })

  // token exists so we are verify different cases there.
  const casesRes = resolveToken({
    token: accessToken,
    type: 'Access',
    path: path,
  })

  if (casesRes?.status === 'failed' || casesRes?.status === 'error')
    return casesRes

  // token verified: now check session exists in database or not.
  // we can use redis to stop is db call each time a user asking data from a page.

  try {
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

/**
 * Evaluates the authenticated or not:
 * Step 1: Checks for the presence of Access and Refresh tokens.
 * Step 2: If an Access token exists, verifies it and retrieves basic user details from the DB.
 * Step 3: If only a Refresh token exists, flags the session as needing a token rotation.
 * Output: Returns a success payload with user data, a 'refresh_required' flag, or an 'unauthorized' failure.
 */

export async function validateSession(
  currentPath = '/dashboard'
): Promise<AuthCheckResult> {
  const path = currentPath || '/dashboard'

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

/**
 * GOAL: Performs a silent token rotation using a valid Refresh Token.
 * HOW?:
    Step 1: Retrieves and verifies the signature of the current Refresh token.
    Step 2: Validates the token against the active sessions stored in the database.
    Step 3: Generates a fresh pair of Access and Refresh tokens.
    Step 4: Updates the session in the database and overwrites the user's cookies.
 * Output: Returns success with the userId if rotated, or fails and clears cookies if the session is invalid.
 */
export async function tryRefreshToken(
  currentPath = '/api/auth/refresh'
): Promise<RefreshResult> {
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
    const session = await prismaClient.session.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    })

    if (
      !session ||
      session.userId !== userId ||
      session.expiresAt.getTime() <= Date.now()
    ) {
      if (session?.expiresAt && session.expiresAt.getTime() <= Date.now()) {
        await deleteSessionByToken(refreshToken)
      }
      await clearAuthCookies()
      return { status: 'failed', error: 'session_not_found' }
    }

    if (!session.user) {
      await clearAuthCookies()
      return { status: 'failed', error: 'user_not_found' }
    }

    const newAccessToken = generateAccessToken({
      userId: session.user.id,
      email: session.user.email,
    })
    const newRefreshToken = generateRefreshToken({ userId: session.user.id })

    await prismaClient.session.update({
      where: { token: refreshToken },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    await accessTokenCookie(newAccessToken)
    await refreshTokenCookie(newRefreshToken)

    return { status: 'success', data: { userId: session.user.id } }
  } catch (err) {
    console.error('tryRefreshToken failed:', err)
    await clearAuthCookies()
    return { status: 'failed', error: 'session_not_found' }
  }
}
