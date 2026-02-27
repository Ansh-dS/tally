// 1. ALL vi.mock calls MUST come first, even before other imports
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { mockDeep, mockReset, type DeepMockProxy } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';

// 2. Mocking modules before importing the service they affect
vi.mock('@db/client', () => ({
    prismaClient: mockDeep<PrismaClient>(),
}));

vi.mock('@auth/cookies', () => ({
    accessTokenCookie: vi.fn(),
    refreshTokenCookie: vi.fn(),
}));

vi.mock('@auth/jwt', () => ({
    generateAccessToken: vi.fn(() => 'mock-access-token'),
    generateRefreshToken: vi.fn(() => 'mock-refresh-token'),
}));

vi.mock('@utils/hash', () => ({
    default: vi.fn(() => Promise.resolve('hashed_password_123')),
    verifyPassword: vi.fn(() => Promise.resolve(true)),
}));

vi.mock('@db/connect', () => ({
    default: vi.fn(() => Promise.resolve({ status: 200 })),
}));

// 3. Now import the service and the mocked client
import { signupHandler, loginHandler } from '../service';
import { prismaClient } from '@db/client';

// 4. Properly cast the mock for TypeScript
const prismaMock = prismaClient as unknown as DeepMockProxy<PrismaClient>;

describe('Auth Service Logic', () => {
    beforeEach(() => {
        mockReset(prismaMock);
    });

    it('should successfully create user and session', async () => {
        // 1. Setup mocks
        prismaMock.user.findUnique.mockResolvedValue(null);
        prismaMock.user.create.mockResolvedValue({ id: 'new-user-id', email: 'new@example.com' } as any);
        prismaMock.session.create.mockResolvedValue({ id: 'session-id' } as any);

        // 2. Call handler
        const result = await signupHandler({ email: 'new@example.com', password: 'ValidPass123' });
        console.log("DEBUG SIGNUP RESULT:", JSON.stringify(result, null, 2)); //
        // 3. Verify status first
        expect(result.statusCode).toBe(200);

        // 4. Safe data check (Fixes the TypeError)
        expect(result.data).toBeDefined(); // Ensures data is not undefined

        // Use a type-safe assertion to check the property
        const responseData = result.data as { email: string };
        expect(responseData.email).toBe('new@example.com');

        expect(prismaMock.user.create).toHaveBeenCalled();
    });

    it('should return 400 if email already exists', async () => {
        prismaMock.user.findUnique.mockResolvedValue({ id: 'existing-id', email: 'taken@test.com' } as any);

        const result = await signupHandler({ email: 'taken@test.com', password: 'ValidPass123' });

        expect(result.statusCode).toBe(400);
        expect(result.message).toContain('already registered');
    });
});

describe('loginHandler', () => {
    it('should return 200 on valid credentials', async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            id: 'user-id',
            email: 'test@example.com',
            password: 'hashed-password'
        } as any);

        const result = await loginHandler({ email: 'test@example.com', password: 'password' });

        expect(result.statusCode).toBe(200);
    });
});
