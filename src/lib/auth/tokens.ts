
import {
    errorResponse, successResponse,failedResponse
} from '@utils/common';
import { Prisma } from '@prisma/client';
import resolveToken, { generateAccessToken } from '@auth/jwt';
import { prismaClient } from '@db/client';
import { accessTokenCookie } from '@auth/cookies';
import {  refreshSecretKey } from '@utils/common';
import jwt from 'jsonwebtoken'
import { getToken } from '@auth/cookies';

interface regenerateTokenInput  {
    accessToken: string | null;
    path: string;
}


interface resolveTokenInput {
    refreshToken: string;
    userId: string;
    path: string;
}

export async function regenerateAccessToken(payload: resolveTokenInput) {
    const { refreshToken, userId, path } = payload;

    try {
        //Check refresh token in sessions table
        const record = await prismaClient.session.findUnique({
            where: {
                token: refreshToken,
            },
            // internally using join to filter the
            include: {
                user: {
                    select: { email: true },
                },
            },
        });

        // session doesn't exists.
        if (!record) {
            // reach the login
            return errorResponse({
                statusCode: 401,
                message: 'Refresh token not found or session expired.',
                path,
            });
        }

        // session exists.
        // generate and store access token

        const accessToken = generateAccessToken({
            email: record.user.email,
            userId: userId,
        });
        accessTokenCookie(accessToken);

        // continue the request.
        return successResponse({
            statusCode: 200,
            message: 'Access token regenerated.',
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            return failedResponse({
                statusCode: 400,
                message: 'DB request error',
                path,
            });
        }
        if (err instanceof Prisma.PrismaClientValidationError) {
            return failedResponse({ statusCode: 400, message: 'Invalid query', path });
        }
        if (err instanceof Prisma.PrismaClientInitializationError) {
            return errorResponse({
                statusCode: 500,
                message: 'DB initialization/connection failed',
                path,
            });
        }
        return errorResponse({
            statusCode: 500,
            message: 'Unknown database error',
            path,
        });
    }
}


export default async function resolveAccessToken(payload: regenerateTokenInput) {
    const { accessToken, path } = payload;

    // access token missing
    if (accessToken === 'null') {
        // return error.
        return failedResponse({
            statusCode: 401,
            message: "Can't find access Token",
            path: path,
            error: 'missing',
        });
    }

    // not missing.
    else if (typeof accessToken === 'string') {
        // cases for access token.
        const res = resolveToken({ token: accessToken,type: 'Access', path: path });

        if (typeof res === 'string') {
            // function: autherization check
        } else if (res.message === 'invalid' || res.message === 'malformed') {
            return res;
        }

        //expired (check refresh token.)
        else if (res.message === 'expired') {
            const refreshToken = getToken('jwtRefreshToken');
            // refresh token exists
            if (typeof refreshToken === 'string') {
                try {
                    const decode = jwt.verify(refreshToken, refreshSecretKey);
                    
                    //regenerate and store the access token
                    if (typeof decode === 'object')
                        return regenerateAccessToken({
                            userId: decode.userId,
                            refreshToken: refreshToken,
                            path: 'api/auth/login',
                        });
                } catch (err: unknown) {
                    return failedResponse({
                        statusCode: 401,
                        message: "Can't find refresh token",
                        path: path,
                    });
                }
            }
            // refresh token doesn't exists.
            else {
                // revert it to login:
                return failedResponse({
                    statusCode: 401,
                    message: "Refresh token doesn't exists.",
                    path: path,
                    data: { "url": "./login"}
                });
            }
        }
    }
}
