import {
  errorResponse,
  failedResponse,
  successResponse,
  ApiResponse,
} from '@/lib/utils/apiResponse'
import { validateSession } from '@auth/session'

// Verify the user's active session.
export async function protectApiRoute(
  path: string
): Promise<Partial<ApiResponse>> {
  // Step 1: Validate session token signatures and lookup user identity.
  const result = await validateSession(path)

  // Step 2: Handle token refresh requirements or authorization failures.
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

  // Step 3: Return a successful authorization response if verification succeeded.
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
