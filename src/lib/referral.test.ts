import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isValidReferralCodeFormat,
  normalizeReferralCode,
  getReferralErrorMessage,
  ReferralResult,
  ProcessReferralResult,
} from './referral';

describe('Referral Utilities', () => {
  describe('isValidReferralCodeFormat', () => {
    it('should accept valid CRUMS referral code format', () => {
      expect(isValidReferralCodeFormat('CRUMS-ABC123')).toBe(true);
      expect(isValidReferralCodeFormat('crums-abc123')).toBe(true);
      expect(isValidReferralCodeFormat('CRUMS-XYZ789')).toBe(true);
      expect(isValidReferralCodeFormat('CRUMS-000000')).toBe(true);
    });

    it('should reject codes without CRUMS prefix', () => {
      expect(isValidReferralCodeFormat('ABC123')).toBe(false);
      expect(isValidReferralCodeFormat('REF-ABC123')).toBe(false);
      expect(isValidReferralCodeFormat('PROMO-ABC123')).toBe(false);
    });

    it('should reject codes with wrong length suffix', () => {
      expect(isValidReferralCodeFormat('CRUMS-ABC')).toBe(false);
      expect(isValidReferralCodeFormat('CRUMS-AB')).toBe(false);
      expect(isValidReferralCodeFormat('CRUMS-ABCDEFGH')).toBe(false);
      expect(isValidReferralCodeFormat('CRUMS-ABC12345')).toBe(false);
    });

    it('should reject codes with special characters', () => {
      expect(isValidReferralCodeFormat('CRUMS-ABC@23')).toBe(false);
      expect(isValidReferralCodeFormat('CRUMS-ABC 23')).toBe(false);
      expect(isValidReferralCodeFormat('CRUMS-ABC#23')).toBe(false);
      expect(isValidReferralCodeFormat('CRUMS-ABC-23')).toBe(false);
    });

    it('should handle empty and whitespace strings', () => {
      expect(isValidReferralCodeFormat('')).toBe(false);
      expect(isValidReferralCodeFormat('   ')).toBe(false);
      expect(isValidReferralCodeFormat('\t\n')).toBe(false);
    });

    it('should handle codes with leading/trailing whitespace', () => {
      expect(isValidReferralCodeFormat('  CRUMS-ABC123  ')).toBe(true);
      expect(isValidReferralCodeFormat('\tCRUMS-ABC123\n')).toBe(true);
    });
  });

  describe('normalizeReferralCode', () => {
    it('should convert to uppercase', () => {
      expect(normalizeReferralCode('crums-abc123')).toBe('CRUMS-ABC123');
      expect(normalizeReferralCode('Crums-Abc123')).toBe('CRUMS-ABC123');
    });

    it('should trim whitespace', () => {
      expect(normalizeReferralCode('  CRUMS-ABC123  ')).toBe('CRUMS-ABC123');
      expect(normalizeReferralCode('\tCRUMS-ABC123\n')).toBe('CRUMS-ABC123');
    });

    it('should handle both case and whitespace', () => {
      expect(normalizeReferralCode('  crums-abc123  ')).toBe('CRUMS-ABC123');
    });
  });

  describe('getReferralErrorMessage', () => {
    it('should provide user-friendly message for self-referral', () => {
      const result = getReferralErrorMessage('You cannot refer yourself');
      expect(result.message).toBe("Oops! You can't use your own referral code. Ask a friend to share theirs!");
      expect(result.variant).toBe('destructive');
    });

    it('should provide user-friendly message for duplicate referral', () => {
      const result = getReferralErrorMessage('This email has already been referred');
      expect(result.message).toBe('This email has already been referred by another customer.');
      expect(result.variant).toBe('default');
    });

    it('should provide user-friendly message for invalid code', () => {
      const result = getReferralErrorMessage('Invalid or inactive referral code');
      expect(result.message).toBe('This referral code is invalid or no longer active.');
      expect(result.variant).toBe('destructive');
    });

    it('should pass through unknown errors with destructive variant', () => {
      const result = getReferralErrorMessage('Unknown database error');
      expect(result.message).toBe('Unknown database error');
      expect(result.variant).toBe('destructive');
    });
  });

  describe('RPC response handling', () => {
    // Mock types for referral responses
    const createSuccessResponse = (): ReferralResult => ({
      success: true,
      referral_id: '123e4567-e89b-12d3-a456-426614174000',
    });

    const createErrorResponse = (error: string): ReferralResult => ({
      success: false,
      error,
    });

    it('should identify successful referral', () => {
      const response = createSuccessResponse();
      expect(response.success).toBe(true);
      expect(response.referral_id).toBeDefined();
      expect(response.error).toBeUndefined();
    });

    it('should identify self-referral error', () => {
      const response = createErrorResponse('You cannot refer yourself');
      expect(response.success).toBe(false);
      expect(response.error).toBe('You cannot refer yourself');
    });

    it('should identify duplicate referral error', () => {
      const response = createErrorResponse('This email has already been referred');
      expect(response.success).toBe(false);
      expect(response.error).toBe('This email has already been referred');
    });

    it('should identify invalid code error', () => {
      const response = createErrorResponse('Invalid or inactive referral code');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid or inactive referral code');
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
