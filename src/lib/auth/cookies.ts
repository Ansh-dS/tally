// services/createCookies.ts
import { cookies } from 'next/headers';

/**
 * Set an httpOnly access token cookie in server context (server action / server component).
 * Throws an Error if setting the cookie fails so callers can handle it.
 */
export async function accessTokenCookie(jwtToken: string): Promise<string> {
    try {
        if (!jwtToken) throw new Error('accessTokenCookie: jwtToken is required');

        const cookieStore = await cookies();
        cookieStore.set({
            name: 'jwtAccessToken',
            value: jwtToken,
            httpOnly: true,
            path: '/',
            // Optionally add: secure: true, sameSite: 'lax', maxAge: 15 * 60
        });

        return 'Cookie has been created';
    } catch (err) {
        // Log helpful debug info and rethrow so caller can decide what to do
        console.error('accessTokenCookie - failed to set cookie:', {
            message: (err as Error).message,
            stack: (err as Error).stack,
        });
        throw new Error('Failed to set access token cookie');
    }
}

/**
 * Set an httpOnly refresh token cookie in server context (server action / server component).
 * Throws an Error if setting the cookie fails so callers can handle it.
 */
export async function refreshTokenCookie(jwtToken: string): Promise<string> {
    try {
        if (!jwtToken) throw new Error('refreshTokenCookie: jwtToken is required');

        const cookieStore = await cookies();
        cookieStore.set({
            name: 'jwtRefreshToken',
            value: jwtToken,
            httpOnly: true,
            path: '/',
            // Optionally add: secure: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60
        });

        return 'Cookie has been created';
    } catch (err) {
        console.error('refreshTokenCookie - failed to set cookie:', {
            message: (err as Error).message,
            stack: (err as Error).stack,
        });
        throw new Error('Failed to set refresh token cookie');
    }
}

/**
 * Read a cookie value from the server cookie store.
 * Returns the cookie value or null. On internal error also returns null and logs the error.
 */
export async function getToken(
    tokenType: 'jwtRefreshToken' | 'jwtAccessToken'
): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const jwtToken = cookieStore.get(tokenType);

        if (!jwtToken) return null;
        return jwtToken.value;
    } catch (err) {
        console.error('getToken - failed to read cookie:', {
            tokenType,
            message: (err as Error).message,
            stack: (err as Error).stack,
        });
        // return null to keep the original contract (caller treats missing token as not-logged-in)
        return null;
    }
}

// these are http-only-cookie.
