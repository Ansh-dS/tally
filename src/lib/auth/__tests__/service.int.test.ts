import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

// 1. Mock the module FIRST so the 'cookies()' call doesn't crash the test
vi.mock('../cookies', () => ({
    accessTokenCookie: vi.fn(),
    refreshTokenCookie: vi.fn(),
}));

import { signupHandler } from '../service';
import { prismaClient } from '@db/client';
import * as cookieUtils from '../cookies';

describe('Auth Service Integration (Real DB)', () => {
    // Generate unique emails for each run to avoid collisions
    const testEmail = `test-${Date.now()}@iitp.ac.in`;
    const testPassword = 'SecurePassword123!';
    const cookieTestEmail = `cookie-test-${Date.now()}@iitp.ac.in`;

    beforeAll(async () => {
        try {
            // Cleanup both potential test emails
            await prismaClient.session.deleteMany({
                where: { user: { email: { in: [testEmail, cookieTestEmail] } } }
            });
            await prismaClient.user.deleteMany({
                where: { email: { in: [testEmail, cookieTestEmail] } }
            });
        } catch (e) {
            console.log("Cleanup: Initial database state clean.");
        }
    });

    afterAll(async () => {
        await prismaClient.$disconnect();
    });

    it('should physically create a user and a session in the database', async () => {
        const result = await signupHandler({
            email: testEmail,
            password: testPassword,
        });

        expect(result.statusCode).toBe(200);

        const userInDb = await prismaClient.user.findUnique({
            where: { email: testEmail }
        });
        expect(userInDb).not.toBeNull();
        expect(userInDb?.email).toBe(testEmail);

        const sessionInDb = await prismaClient.session.findFirst({
            where: { userId: userInDb?.id }
        });
        expect(sessionInDb).not.toBeNull();
    });

    it('should fail when attempting to register the same email twice', async () => {
        const result = await signupHandler({
            email: testEmail,
            password: testPassword,
        });

        expect(result.statusCode).toBe(400);
      expect(result.message).toMatch(/already registered/i);
    });

    it('should trigger cookie creation after successful DB entry', async () => {
        // We use the mocked function as a spy
        const result = await signupHandler({ 
            email: cookieTestEmail, 
            password: 'Password123' 
        });

        expect(result.statusCode).toBe(200);

        // Verify the mock was called
        expect(cookieUtils.accessTokenCookie).toHaveBeenCalledWith(expect.any(String));
        expect(cookieUtils.refreshTokenCookie).toHaveBeenCalledWith(expect.any(String));
    });
});