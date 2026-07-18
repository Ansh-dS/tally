import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import {
  accessSecretKey,
  failedResponse,
  refreshSecretKey,
  visitorSecretKey,
} from '../utils/apiResponse'
import { errorResponse, ApiResponse } from '@/lib/utils/apiResponse'
import { JwtPayload } from 'jsonwebtoken'
interface accessTokenPayload {
  email: string
  userId: string
}
interface refreshTokenPayload {
  userId: string
}

interface verifyTokenInput {
  token: string
  type: 'Access' | 'Refresh' | 'Visitor'
  path: string
}

export function generateAccessToken(payload: accessTokenPayload): string {
  const data = {
    ...payload,
    type: 'access',
  }
  const token = jwt.sign(data, `${accessSecretKey}`, { expiresIn: '15min' })

  return token
}

export function generateRefreshToken(payload: refreshTokenPayload): string {
  const data = {
    ...payload,
    type: 'refresh',
  }
  const token = jwt.sign(data, `${refreshSecretKey}`, { expiresIn: '7d' })

  return token
}

export function generateVisitorToken(
  userAgent: string,
  formId: string
): string {
  const data = {
    formId: formId,
    userAgent: userAgent,
    visitorId: crypto.randomUUID(),
  }

  const visitorId = jwt.sign(data, `${visitorSecretKey}`, { expiresIn: '24h' })
  return visitorId
}

export default function resolveToken(
  verifyInput: verifyTokenInput
): Partial<ApiResponse<unknown | JwtPayload>> {
  const { token, type, path } = verifyInput
  const secretKey =
    type === 'Access'
      ? accessSecretKey
      : type === 'Refresh'
        ? refreshSecretKey
        : visitorSecretKey
  try {
    const jwtRes = jwt.verify(token, secretKey) as JwtPayload
    return {
      status: 'success',
      data: jwtRes,
    }
  } catch (err) {
    // using JsonWebTokenError to check two types of error.
    if (err instanceof jwt.JsonWebTokenError) {
      const message = err.message.toLowerCase()
      // malformed:
      if (message === 'malformed') {
        return failedResponse({
          statusCode: 400,
          message: 'Ivailed jwt structure',
          path: path,
          error: 'malformed',
        })
      }
      // invailed:
      else if (message === 'invalid signature') {
        return failedResponse({
          statusCode: 401,
          message: "Secret key doesn't match",
          path: path,
          error: 'invalid',
        })
      }
    }

    // Expired:
    else if (err instanceof jwt.TokenExpiredError) {
      return failedResponse({
        statusCode: 401,
        message: `${type} token is already expired`,
        path: path,
        error: 'expired',
      })

      // try refresh token.
    }

    return errorResponse({
      statusCode: 500,
      message: `Unexpected error during ${type} verification`,
      path: path,
    })
  }
}
