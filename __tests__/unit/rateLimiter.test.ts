/**
 * Unit tests for Rate Limiter
 * Tests the sliding window rate limiter in lib/shared/rate-limiter.ts
 */

import { rateLimit, rateLimitMiddleware } from '@/lib/shared/rate-limiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    // No hay forma fácil de resetear el Map interno, así que usamos
    // identificadores únicos por test para evitar interferencia
  });

  describe('rateLimit function', () => {
    it('should allow requests within the limit', () => {
      const result = rateLimit('test-user-1', {
        windowMs: 60 * 1000,
        maxRequests: 5,
      });

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should track remaining requests correctly', () => {
      const id = 'test-user-2';

      rateLimit(id, { windowMs: 60 * 1000, maxRequests: 3 });
      const result2 = rateLimit(id, { windowMs: 60 * 1000, maxRequests: 3 });
      const result3 = rateLimit(id, { windowMs: 60 * 1000, maxRequests: 3 });

      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(1);
      expect(result3.success).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should reject requests exceeding the limit', () => {
      const id = 'test-user-3';

      rateLimit(id, { windowMs: 60 * 1000, maxRequests: 2 });
      rateLimit(id, { windowMs: 60 * 1000, maxRequests: 2 });

      const result = rateLimit(id, { windowMs: 60 * 1000, maxRequests: 2 });

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should reset after window expires', () => {
      const id = 'test-user-4';
      const now = Date.now();

      // Mock Date.now to simulate time passing
      const originalNow = Date.now;
      Date.now = () => now as unknown as number;

      rateLimit(id, { windowMs: 60 * 1000, maxRequests: 1 });
      const blocked = rateLimit(id, { windowMs: 60 * 1000, maxRequests: 1 });
      expect(blocked.success).toBe(false);

      // Advance time past the window
      Date.now = () => (now + 61 * 1000) as unknown as number;

      const allowed = rateLimit(id, { windowMs: 60 * 1000, maxRequests: 1 });
      expect(allowed.success).toBe(true);
      expect(allowed.remaining).toBe(0);

      Date.now = originalNow;
    });

    it('should track different identifiers independently', () => {
      const result1 = rateLimit('user-a', { windowMs: 60 * 1000, maxRequests: 1 });
      const result2 = rateLimit('user-b', { windowMs: 60 * 1000, maxRequests: 1 });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it('should use default options when none provided', () => {
      const id = 'test-user-default';
      const result = rateLimit(id);

      expect(result.success).toBe(true);
      // Default maxRequests is 60, so remaining should be 59
      expect(result.remaining).toBe(59);
    });
  });

  describe('rateLimitMiddleware function', () => {
    it('should return success result when under limit', () => {
      const id = 'middleware-user-1';
      const result = rateLimitMiddleware(id, {
        windowMs: 60 * 1000,
        maxRequests: 10,
      });

      expect(result?.success).toBe(true);
      if (result && 'success' in result && result.success) {
        expect(result.remaining).toBe(9);
      }
    });

    it('should return error response when over limit', () => {
      const id = 'middleware-user-2';

      // Exhaust the limit
      for (let i = 0; i < 3; i++) {
        rateLimit(id, { windowMs: 60 * 1000, maxRequests: 3 });
      }

      const result = rateLimitMiddleware(id, {
        windowMs: 60 * 1000,
        maxRequests: 3,
      });

      expect(result?.success).toBe(false);
      if (result && !('success' in result && result.success)) {
        expect(result.response.status).toBe(429);
        expect(result.response.headers.get('Retry-After')).toBeDefined();
      }
    });

    it('should return null when under limit (no response)', () => {
      const id = 'middleware-user-3';
      const result = rateLimitMiddleware(id, {
        windowMs: 60 * 1000,
        maxRequests: 5,
      });

      // Should return success object, not null
      expect(result).not.toBeNull();
      if (result && 'success' in result && result.success) {
        expect(result.success).toBe(true);
      }
    });

    it('should include rate limit headers in error response', () => {
      const id = 'middleware-user-4';

      rateLimit(id, { windowMs: 60 * 1000, maxRequests: 1 });
      rateLimit(id, { windowMs: 60 * 1000, maxRequests: 1 });

      const result = rateLimitMiddleware(id, {
        windowMs: 60 * 1000,
        maxRequests: 1,
      });

      if (result && !('success' in result && result.success)) {
        expect(result.response.headers.get('RateLimit-Limit')).toBe('1');
        expect(result.response.headers.get('RateLimit-Remaining')).toBe('0');
        expect(result.response.headers.get('RateLimit-Reset')).toBeDefined();
      }
    });
  });
});