// we may "x" key in data while not in other.
export interface LoginResponseData {
  id: string
  email: string
}

// message: clear, polite instruction that a person can follow.
// data: we send that things in data which at the end triggers:
//1. some code of frontend or.
//2. the place where we call the function.
// defined for both, sucess and failure
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error' | 'failed'
  statusCode: number
  message: string
  error?: string | T
  data?: T
  timestamp?: string // When response was created
  path?: string // Which endpoint was called
}

// only return the key-value for which you have provide value.
export function cleanResponse<T = unknown>(
  payload: Partial<ApiResponse<T>>
): Partial<ApiResponse<T>> {
  const arr = Object.entries(payload).filter(([, value]) => {
    if (value !== undefined && value !== null) {
      return true
    }
    return false
  })

  const res = Object.fromEntries(arr) as Partial<ApiResponse<T>>

  return res
}

export function loginSuccessResponse(
  data: LoginResponseData
): Partial<ApiResponse<LoginResponseData>> {
  // building the payload
  const payload: ApiResponse<LoginResponseData> = {
    status: 'success',
    statusCode: 200,
    message: 'Login successful',
    data: data, // It uses the data you passed in
    timestamp: new Date().toISOString(),
    path: '/api/auth/login',
  }

  return cleanResponse(payload)
}

export function errorResponse<T = unknown>(
  data: Partial<ApiResponse<T>>
): Partial<ApiResponse<T>> {
  // building the payload
  const payload: Partial<ApiResponse<T>> = {
    status: 'error',
    statusCode: data.statusCode || 500,
    message: data.message || 'An internal error occurred',
    error: data.error, // Added missing error field
    timestamp: new Date().toISOString(),
    path: data.path,
  }

  return cleanResponse(payload)
}

export function failedResponse<T = unknown>(
  data: Partial<ApiResponse<T>>
): Partial<ApiResponse<T>> {
  // building the payload
  const payload: Partial<ApiResponse<T>> = {
    status: 'failed',
    statusCode: data.statusCode || 400,
    message: data.message || 'Request failed',
    data: data.data, // Added missing data field
    timestamp: new Date().toISOString(),
    path: data.path,
  }

  return cleanResponse(payload)
}

export function successResponse<T = unknown>(
  data: Partial<ApiResponse<T>>
): Partial<ApiResponse<T>> {
  // building the payload
  const payload: Partial<ApiResponse<T>> = {
    status: 'success',
    statusCode: data.statusCode || 200,
    message: data.message || 'Operation successful',
    data: data.data, // FIXED: Added missing data field
    timestamp: new Date().toISOString(),
    path: data.path,
  }

  return cleanResponse(payload)
}

export const accessSecretKey = process.env.JWT_ACCESS_TOKEN_SECRET as string
export const refreshSecretKey = process.env.JWT_REFRESH_TOKEN_SECRET as string
