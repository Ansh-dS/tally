import { describe, it, expect, vi } from 'vitest';
import { accessTokenCookie } from '../cookies';
import { cookies } from 'next/headers';

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    set: vi.fn(),
  })),
}));

describe('Auth Cookie Utilities', () => {
  it('should configure accessToken with maximum security', async () => {
    const mockSet = vi.fn();
    (cookies as any).mockReturnValue(Promise.resolve({ set: mockSet }));

    await accessTokenCookie('test-token');

    // We check for the single object argument instead of three separate ones
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'jwtAccessToken', // Matches your actual code
        value: 'test-token',
        httpOnly: true,
        path: '/',
      })
    );
  });
});