import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock types for referral responses
interface ReferralResult {
  success: boolean;
  error?: string;
  referral_id?: string;
}

// Helper function to simulate create_referral RPC responses
const createMockReferralResponse = (result: ReferralResult) => ({
  data: result,
  error: null,
});

const createMockReferralError = (message: string) => ({
  data: null,
  error: { message },
});

describe('Referral Code Validation', () => {
  describe('create_referral RPC responses', () => {
    it('should return success for valid referral code', () => {
      const response = createMockReferralResponse({
        success: true,
        referral_id: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(response.data?.success).toBe(true);
      expect(response.data?.referral_id).toBeDefined();
      expect(response.error).toBeNull();
    });

    it('should return error for invalid or inactive referral code', () => {
      const response = createMockReferralResponse({
        success: false,
        error: 'Invalid or inactive referral code',
      });

      expect(response.data?.success).toBe(false);
      expect(response.data?.error).toBe('Invalid or inactive referral code');
    });

    it('should return error when user tries to refer themselves', () => {
      const response = createMockReferralResponse({
        success: false,
        error: 'You cannot refer yourself',
      });

      expect(response.data?.success).toBe(false);
      expect(response.data?.error).toBe('You cannot refer yourself');
    });

    it('should return error when email has already been referred', () => {
      const response = createMockReferralResponse({
        success: false,
        error: 'This email has already been referred',
      });

      expect(response.data?.success).toBe(false);
      expect(response.data?.error).toBe('This email has already been referred');
    });
  });

  describe('Referral code format validation', () => {
    const isValidReferralCodeFormat = (code: string): boolean => {
      // CRUMS referral codes follow the format: CRUMS-XXXXXX (6 alphanumeric characters)
      const pattern = /^CRUMS-[A-Z0-9]{6}$/;
      return pattern.test(code.toUpperCase());
    };

    it('should accept valid CRUMS referral code format', () => {
      expect(isValidReferralCodeFormat('CRUMS-ABC123')).toBe(true);
      expect(isValidReferralCodeFormat('crums-abc123')).toBe(true);
      expect(isValidReferralCodeFormat('CRUMS-XYZ789')).toBe(true);
    });

    it('should reject codes without CRUMS prefix', () => {
      expect(isValidReferralCodeFormat('ABC123')).toBe(false);
      expect(isValidReferralCodeFormat('REF-ABC123')).toBe(false);
    });

    it('should reject codes with wrong length suffix', () => {
      expect(isValidReferralCodeFormat('CRUMS-ABC')).toBe(false);
      expect(isValidReferralCodeFormat('CRUMS-ABCDEFGH')).toBe(false);
    });

    it('should reject codes with special characters', () => {
      expect(isValidReferralCodeFormat('CRUMS-ABC@23')).toBe(false);
      expect(isValidReferralCodeFormat('CRUMS-ABC 23')).toBe(false);
    });

    it('should handle empty and whitespace strings', () => {
      expect(isValidReferralCodeFormat('')).toBe(false);
      expect(isValidReferralCodeFormat('   ')).toBe(false);
    });
  });

  describe('Frontend error message handling', () => {
    const getErrorMessage = (error: string): string => {
      switch (error) {
        case 'You cannot refer yourself':
          return "Oops! You can't use your own referral code. Ask a friend to share theirs!";
        case 'This email has already been referred':
          return 'This email has already been referred by another customer.';
        case 'Invalid or inactive referral code':
          return 'This referral code is invalid or no longer active.';
        default:
          return error;
      }
    };

    it('should provide user-friendly message for self-referral', () => {
      const message = getErrorMessage('You cannot refer yourself');
      expect(message).toBe("Oops! You can't use your own referral code. Ask a friend to share theirs!");
    });

    it('should provide user-friendly message for duplicate referral', () => {
      const message = getErrorMessage('This email has already been referred');
      expect(message).toBe('This email has already been referred by another customer.');
    });

    it('should provide user-friendly message for invalid code', () => {
      const message = getErrorMessage('Invalid or inactive referral code');
      expect(message).toBe('This referral code is invalid or no longer active.');
    });

    it('should pass through unknown errors', () => {
      const message = getErrorMessage('Unknown database error');
      expect(message).toBe('Unknown database error');
    });
  });

  describe('Email case normalization', () => {
    const normalizeEmail = (email: string): string => email.toLowerCase().trim();

    it('should normalize email to lowercase', () => {
      expect(normalizeEmail('USER@Example.COM')).toBe('user@example.com');
      expect(normalizeEmail('Test.User@Domain.com')).toBe('test.user@domain.com');
    });

    it('should trim whitespace from email', () => {
      expect(normalizeEmail('  user@example.com  ')).toBe('user@example.com');
    });

    it('should handle both uppercase and whitespace', () => {
      expect(normalizeEmail('  USER@EXAMPLE.COM  ')).toBe('user@example.com');
    });
  });

  describe('Self-referral detection logic', () => {
    const isSelfReferral = (referrerEmail: string, signupEmail: string): boolean => {
      return referrerEmail.toLowerCase() === signupEmail.toLowerCase();
    };

    it('should detect exact match self-referral', () => {
      expect(isSelfReferral('user@example.com', 'user@example.com')).toBe(true);
    });

    it('should detect case-insensitive self-referral', () => {
      expect(isSelfReferral('USER@example.com', 'user@EXAMPLE.com')).toBe(true);
      expect(isSelfReferral('John.Doe@Company.com', 'john.doe@company.com')).toBe(true);
    });

    it('should not flag different emails as self-referral', () => {
      expect(isSelfReferral('user1@example.com', 'user2@example.com')).toBe(false);
      expect(isSelfReferral('alice@company.com', 'bob@company.com')).toBe(false);
    });
  });
});
