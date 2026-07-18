'use server'

import hashPassword from '@utils/hash'
import {
  ApiResponse,
  errorResponse,
  successResponse,
  loginSuccessResponse,
  LoginResponseData,
} from '@/lib/utils/apiResponse'
import { generateRefreshToken, generateAccessToken } from '@auth/jwt'
import { prismaClient } from '@db/client'
import { verifyPassword } from '@utils/hash'
import { accessTokenCookie, refreshTokenCookie } from '@auth/cookies'
import { authSchema } from '@schemas/auth'
import { handleQueryError } from '@/lib/db/query-error'

//variables:
const loginPath = 'api/auth/login'
const signupPath = '/api/auth/signup'

// Register a new user and generate a new session.
// does NOT produce an HTTP response just returns data.
export async function signupHandler(payload: {
  email: string
  password: string
}): Promise<Partial<ApiResponse>> {
  const { email, password } = payload

  let record: { id: string; email: string }
  try {
    // Step 1: Hash the provided password for secure storage.
    const hashedPassword = await hashPassword(password, signupPath)

    // Step 2: Create a new user record in the database.
    record = await prismaClient.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    })
  } catch (err) {
    console.error('User creation failed:', err)
    return handleQueryError(err, signupPath)
  }

  // Step 3: Generate new cryptographically signed Access and Refresh tokens for the user.
  const refreshToken = generateRefreshToken({ userId: record.id })
  const accessToken = generateAccessToken({
    email: email,
    userId: record.id,
  })

  try {
    // Step 4: Store the Refresh token in the database to establish a persistent session.
    // storing refresh token in database.
    // {connect: { id:xyx }} a way to add foriegn key.
    // "id" not "userId" as recomended
    await prismaClient.session.create({
      data: {
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1000: to get number of miliseconds in 7 days.
        user: { connect: { id: record.id } },
      },
    })

    // Step 5: Set secure HTTP-only cookies for both tokens and return success.
    await refreshTokenCookie(refreshToken)
    await accessTokenCookie(accessToken)

    return successResponse({
      message: 'Account created successfully',
      statusCode: 200,
      data: { email: email },
    })
    // navigating to /dashboard.
    // going to use server action
  } catch (err: unknown) {
    return handleQueryError(err, signupPath)
  }
}

// Authenticate an existing user and establish a new session.
// does NOT produce an HTTP response just returns data.
export async function loginHandler(payload: {
  email: string
  password: string
}): Promise<Partial<ApiResponse> | Partial<ApiResponse<LoginResponseData>>> {
  // Step 1: Validate the incoming email/password payload schema.
  const res = authSchema.safeParse(payload)

  if (!res.success) {
    return errorResponse({
      statusCode: 400,
      message: 'Ivailed request payload',
      path: 'api/auth/login',
    })
  }

  const { email, password } = payload

  try {
    // Step 2: Look up the user in the database by email.
    // checking whether already a user or not
    const user = await prismaClient.user.findUnique({
      where: {
        email: email,
      },
    })

    // checking email and password.
    // not the user.
    if (!user) {
      return errorResponse({
        statusCode: 400,
        message: 'Invalid credentials',
        path: loginPath,
      })
      // redirect to the signup.
      // may going to use server action
    }

    // Step 3: Compare the provided password against the stored hash.
    // Guard: Google-only accounts have no password — direct them to OAuth.
    if (!user.password) {
      return errorResponse({
        statusCode: 400,
        message:
          'This account uses Google Sign-In. Please click "Continue with Google" to log in.',
        path: loginPath,
      })
    }

    // email exists and verifying further details.
    // Comparing passwords and it's after effects.
    const isPasswordMatches = await verifyPassword(password, user.password)
    if (!isPasswordMatches) {
      return errorResponse({
        statusCode: 401,
        message: 'Invalid credentials',
        path: loginPath,
      })
    }

    // Step 4: Generate new cryptographically signed Access and Refresh tokens.
    const accessToken = generateAccessToken({ email: email, userId: user.id })
    const refreshToken = generateRefreshToken({ userId: user.id })

    // Step 5: Create a new session record in the database and set secure cookies.
    await prismaClient.session.create({
      data: {
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        user: { connect: { id: user.id } },
      },
    })

    await accessTokenCookie(accessToken)
    await refreshTokenCookie(refreshToken)

    /*Redirect to dashboard*/
    return loginSuccessResponse({ id: user.id, email: user.email })
  } catch (err) {
    return handleQueryError(err, loginPath)
  }
}
