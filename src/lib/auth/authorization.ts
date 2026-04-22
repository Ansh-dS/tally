import {
  errorResponse,
  failedResponse,
  successResponse,
  ApiResponse,
} from '@/lib/utils/responses'
import { validateSession } from '@auth/session'

/**
 * Verifies the user's active session. (Renamed from authorization to protectApiRoute)
 * Step 1: Retrieves the JWT Access Token from cookies.
 * Step 2: Cryptographically verifies the token's signature and validity.
 * Step 3: Queries the database to ensure the user still exists.
 * Output: Returns a successResponse with user data if valid, or a failedResponse (401/404) if unauthorized.
 */
export async function protectApiRoute(
  path: string
): Promise<Partial<ApiResponse>> {
  const result = await validateSession(path)

  if (result.status === 'error') {
    return errorResponse({
      statusCode: 401,
      message: 'Refresh required',
      error: result.error,
      path,
    })
  }

  if (result.status === 'failed') {
    return failedResponse({
      statusCode: result.error === 'no_tokens' ? 401 : 403,
      message:
        result.error === 'no_tokens' ? 'Unauthorized' : 'Session expired',
      path: path,
    })
  }

  return successResponse({
    statusCode: 200,
    message: 'Authorized',
    data: result.data,
  })
  /*
    we don't need to 'check permissions' here:
        1. If the database says you exist and your token is valid
        2. you are automatically the "Owner" of:
                whatever you are about to create.
    */

  /*
    for edit/delete:
        must check the permissions.
    */
}
