import * as z from 'zod'
import { errorResponse } from '../utils/common'
import { ApiResponse } from '../utils/common';
interface authInput { email: string; password: string }

export const authSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
});


function authValidator(authInput: authInput): Partial<ApiResponse> | string {
    const res = authSchema.safeParse(authInput);

    // res can be null.
    // changed 
    if (res.error) {
        return errorResponse({
            statusCode: 400,
            message: 'Ivailed request payload',
            path: 'auth/api/login',
            error: res.error
        });
    }
    return 'success'
}