
import hashPassword from '@utils/hash';
import {
    ApiResponse, errorResponse, successResponse, loginSuccessResponse,
    LoginResponseData,
} from '@utils/common';
import type { User } from '@prisma/client'
import { generateRefreshToken, generateAccessToken } from '@auth/jwt';
import { prismaClient } from '@db/client';
import { verifyPassword } from '@utils/hash';
import { accessTokenCookie, refreshTokenCookie } from '@auth/cookies';
import { authSchema } from '@schemas/auth';
import { handleQueryError } from '@utils/query-error';
//variables:
const loginPath = 'api/auth/login'
const signupPath = '/api/auth/signup'
// does NOT produce an HTTP response just returns data.
export async function signupHandler(payload: { email: string; password: string }): Promise<Partial<ApiResponse>> {

    const { email, password } = payload;

    // email doesn't already exists.
    // store email and password.
    let record: User;
    try {
        // encrypting the password
        const hashedPassword = await hashPassword(password);

        // as already connected with database.
        // create a new user entry.
        record = await prismaClient.user.create({
            data: {
                email: email,
                password: hashedPassword,
            },
        });
    } catch (err) {
        console.error('User creation failed:', err);
        return handleQueryError(err, signupPath)
    }

    // generating a refresh token
    const refreshToken = generateRefreshToken({ userId: record.id });
    const accessToken = generateAccessToken({
        email: email,
        userId: record.id,
    });

    //store tokens as cookie
    try {
        // storing refresh token in database.
        // {connect: { id:xyx }} a way to add foriegn key.
        // "id" not "userId" as recomended
        await prismaClient.session.create({
            data: {
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                user: { connect: { id: record.id } },
            },
        });

        await refreshTokenCookie(refreshToken);
        await accessTokenCookie(accessToken);

        return successResponse({
            message: 'Account created successfully',
            statusCode: 200,
            data: { email: email }
        })
        // navigating to /dashboard.
        // going to use server action
    } catch (err: unknown) {
        return handleQueryError(err, signupPath)
    }





}


// does NOT produce an HTTP response just returns data.
export async function loginHandler(payload: {
    email: string;
    password: string;
}): Promise<Partial<ApiResponse> | Partial<ApiResponse<LoginResponseData>>> {
    const res = authSchema.safeParse(payload);

    // res can be null.
    if (!res) {
        return errorResponse({
            statusCode: 400,
            message: 'Ivailed request payload',
            path: 'api/auth/login',
        });
    }

    const { email, password } = payload;




    try {
        //checking wheather already a user or not
        const user = await prismaClient.user.findUnique({
            where: {
                email: email,
            },
        });

        // checking email and password.
        // not the user.
        if (!user) {
            const err = errorResponse({
                statusCode: 400,
                message: 'Invalid credentials',
                path: loginPath,
            });
            // redirect to the signup.
            // may going to use server action

            return err;
        }

        // email exists and verfifying further details.
        // Comparing passwords and it's after effects. s
        const isPasswordMatches = await verifyPassword(password, user.password);
        if (!isPasswordMatches) {
            return errorResponse({
                statusCode: 401,
                message: 'Invalid credentials',
                path: loginPath,
            });
        }
        // Creating and generating access token.
        const token = generateAccessToken({ email: email, userId: user.id });
        accessTokenCookie(token);

        /*Redirect to dashboard*/
        return loginSuccessResponse({ id: user.id, email: user.email });

    } catch (err) {
        return handleQueryError(err, loginPath)
    }
}