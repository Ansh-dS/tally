'use server'

import hashPassword from '@utils/hash'
import {
  ApiResponse,
  errorResponse,
  successResponse,
  loginSuccessResponse,
  LoginResponseData,
} from '@/lib/utils/responses'
import { generateRefreshToken, generateAccessToken } from '@auth/jwt'
import { prismaClient } from '@db/client'
import { verifyPassword } from '@utils/hash'
import { accessTokenCookie, refreshTokenCookie } from '@auth/cookies'
import { authSchema } from '@schemas/auth'
import { handleQueryError } from '@/lib/db/query-error'

//variables:
const loginPath = 'api/auth/login'
const signupPath = '/api/auth/signup'

/**
 * USER FLOW: complete user registration flow using different functions. 
    How? 
      Step 1: Hashes the provided password for secure storage.
      Step 2: Creates a new user record in the database.
      Step 3: Generates new Access and Refresh tokens for the user.
      Step 4: Stores the Refresh token in the database to establish a persistent session.
      Step 5: Sets secure HTTP-only cookies for both tokens.
    Output: Returns a successResponse with the user's email, or a failedResponse on database errors.
 */

// does NOT produce an HTTP response just returns data.
export async function signupHandler(payload: {
  email: string
  password: string
}): Promise<Partial<ApiResponse>> {
  const { email, password } = payload

  // email doesn't already exists.
  // store email and password.
  let record: { id: string; email: string }
  try {
    // 1. encrypting the password
    const hashedPassword = await hashPassword(password)

    // as already connected with database.
    // 2. create a new user entry.
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

  // 3. generating a refresh token
  const refreshToken = generateRefreshToken({ userId: record.id })
  const accessToken = generateAccessToken({
    email: email,
    userId: record.id,
  })

  // 4. store tokens as cookie
  try {
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

    // 5. HTTP cookies for both.
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

/**
 * Goal: Authenticates an existing user and establishes a new session.
    How? 
      Step 1: Validates the incoming email/password payload schema.
      Step 2: Looks up the user in the database by email.
      Step 3: Compares the provided password against the stored hash.
      Step 4: Generates new Access and Refresh tokens.
      Step 5: Creates a new session record in the database and sets secure cookies.
    Output: Returns a loginSuccessResponse with user ID/email, or an errorResponse for invalid credentials.
 */

// does NOT produce an HTTP response just returns data.
export async function loginHandler(payload: {
  email: string
  password: string
}): Promise<Partial<ApiResponse> | Partial<ApiResponse<LoginResponseData>>> {
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
    //checking wheather already a user or not
    const user = await prismaClient.user.findUnique({
      where: {
        email: email,
      },
    })

    // checking email and password.
    // not the user.
    if (!user) {
      const err = errorResponse({
        statusCode: 400,
        message: 'Invalid credentials',
        path: loginPath,
      })
      // redirect to the signup.
      // may going to use server action

      return err
    }

    // email exists and verfifying further details.
    // Comparing passwords and it's after effects. s
    const isPasswordMatches = await verifyPassword(password, user.password)
    if (!isPasswordMatches) {
      return errorResponse({
        statusCode: 401,
        message: 'Invalid credentials',
        path: loginPath,
      })
    }
    const accessToken = generateAccessToken({ email: email, userId: user.id })
    const refreshToken = generateRefreshToken({ userId: user.id })

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
