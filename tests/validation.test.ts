import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateLength,
  validateOperatorForPublish,
  validatePackageForDraft,
  validatePackageForPublish,
} from '@/lib/validation';
import type { OperatorProfile, Package } from '@/lib/types';

describe('validateEmail', () => {
  it('accepts a valid email', () => {
    expect(validateEmail('user@example.com')).toEqual({ valid: true });
  });

  it('rejects an empty string', () => {
    expect(validateEmail('')).toEqual({ valid: false, error: 'Email is required' });
  });

  it('rejects whitespace-only', () => {
    expect(validateEmail('   ')).toEqual({ valid: false, error: 'Email is required' });
  });

  it('rejects a malformed email', () => {
    expect(validateEmail('not-an-email')).toEqual({ valid: false, error: 'Enter a valid email address' });
  });

  it('rejects an overly long email', () => {
    const longLocal = 'a'.repeat(250);
    expect(validateEmail(`${longLocal}@example.com`)).toEqual({
      valid: false,
      error: 'Email must be 254 characters or fewer',
    });
  });
});

describe('validatePhone', () => {
  it('accepts a valid UK mobile', () => {
    expect(validatePhone('+44 7700 900123')).toEqual({ valid: true });
  });

  it('accepts a valid UK landline', () => {
    expect(validatePhone('020 7123 4567')).toEqual({ valid: true });
  });

  it('rejects an empty string', () => {
    expect(validatePhone('')).toEqual({ valid: false, error: 'Phone number is required' });
  });

  it('rejects an invalid format', () => {
    expect(validatePhone('12345')).toEqual({ valid: false, error: 'Enter a valid UK phone number' });
  });
});

describe('validateRequired', () => {
  it('accepts a non-empty string', () => {
    expect(validateRequired('hello', 'Name')).toEqual({ valid: true });
  });

  it('rejects null', () => {
    expect(validateRequired(null, 'Name')).toEqual({ valid: false, error: 'Name is required' });
  });

  it('rejects undefined', () => {
    expect(validateRequired(undefined, 'Name')).toEqual({ valid: false, error: 'Name is required' });
  });

  it('rejects an empty string', () => {
    expect(validateRequired('', 'Name')).toEqual({ valid: false, error: 'Name is required' });
  });

  it('rejects a whitespace-only string', () => {
    expect(validateRequired('   ', 'Name')).toEqual({ valid: false, error: 'Name is required' });
  });

  it('accepts the number zero (falsy but valid)', () => {
    expect(validateRequired(0, 'Price')).toEqual({ valid: true });
  });

  it('accepts false (falsy but valid)', () => {
    expect(validateRequired(false, 'Consent')).toEqual({ valid: true });
  });
});

describe('validateLength', () => {
  it('accepts a string within bounds', () => {
    expect(validateLength('hello', { min: 3, max: 10, fieldName: 'Title' })).toEqual({ valid: true });
  });

  it('rejects a string below min', () => {
    expect(validateLength('hi', { min: 3, max: 10, fieldName: 'Title' })).toEqual({
      valid: false,
      error: 'Title must be at least 3 characters',
    });
  });

  it('rejects a string above max', () => {
    expect(validateLength('a'.repeat(15), { min: 3, max: 10, fieldName: 'Title' })).toEqual({
      valid: false,
      error: 'Title must be 10 characters or fewer',
    });
  });

  it('trims before counting', () => {
    expect(validateLength('  hi  ', { min: 3, max: 10, fieldName: 'Title' })).toEqual({
      valid: false,
      error: 'Title must be at least 3 characters',
    });
  });
});

describe('validateOperatorForPublish', () => {
  const baseOperator: OperatorProfile = {
    id: 'op1',
    companyName: 'Test Operator',
    verificationStatus: 'verified',
    tier: 'verified',
    eligibilityFlags: {
      canReceiveBookings: true,
      bankDetailsActive: true,
      onboardingComplete: true,
    },
    contactEmail: 'test@example.com',
  };

  it('accepts a fully eligible operator', () => {
    expect(validateOperatorForPublish(baseOperator)).toEqual({ valid: true });
  });

  it('rejects a non-verified operator', () => {
    expect(validateOperatorForPublish({ ...baseOperator, verificationStatus: 'pending' })).toEqual({
      valid: false,
      error: 'Operator must be verified before publishing packages',
    });
  });

  it('rejects a listed-tier operator', () => {
    expect(validateOperatorForPublish({ ...baseOperator, tier: 'listed' })).toEqual({
      valid: false,
      error: 'Operator tier must be above listed to publish',
    });
  });

  it('rejects an operator without active bank details', () => {
    expect(
      validateOperatorForPublish({
        ...baseOperator,
        eligibilityFlags: { ...baseOperator.eligibilityFlags!, bankDetailsActive: false },
      })
    ).toEqual({
      valid: false,
      error: 'Active bank details are required to publish packages',
    });
  });

  it('rejects an operator with incomplete onboarding', () => {
    expect(
      validateOperatorForPublish({
        ...baseOperator,
        eligibilityFlags: { ...baseOperator.eligibilityFlags!, onboardingComplete: false },
      })
    ).toEqual({
      valid: false,
      error: 'Operator onboarding must be complete before publishing',
    });
  });
});

describe('validatePackageForDraft', () => {
  const basePkg: Partial<Package> = {
    title: 'Valid Package Title',
    pricePerPerson: 1200,
    totalNights: 7,
    nightsMakkah: 4,
    nightsMadinah: 3,
  };

  it('accepts a valid draft package', () => {
    expect(validatePackageForDraft(basePkg)).toEqual({ valid: true });
  });

  it('rejects a missing title', () => {
    expect(validatePackageForDraft({ ...basePkg, title: undefined })).toEqual({
      valid: false,
      error: 'Title is required',
    });
  });

  it('rejects a title that is too short', () => {
    expect(validatePackageForDraft({ ...basePkg, title: 'A' })).toEqual({
      valid: false,
      error: 'Title must be at least 5 characters',
    });
  });

  it('rejects zero price', () => {
    expect(validatePackageForDraft({ ...basePkg, pricePerPerson: 0 })).toEqual({
      valid: false,
      error: 'Price per person must be greater than 0',
    });
  });

  it('rejects negative price', () => {
    expect(validatePackageForDraft({ ...basePkg, pricePerPerson: -10 })).toEqual({
      valid: false,
      error: 'Price per person must be greater than 0',
    });
  });

  it('rejects fewer than 2 total nights', () => {
    expect(validatePackageForDraft({ ...basePkg, totalNights: 1 })).toEqual({
      valid: false,
      error: 'Total nights must be at least 2',
    });
  });

  it('rejects mismatched makkah + madinah nights', () => {
    expect(validatePackageForDraft({ ...basePkg, nightsMakkah: 5, nightsMadinah: 5 })).toEqual({
      valid: false,
      error: 'Makkah nights plus Madinah nights must equal total nights',
    });
  });
});

describe('validatePackageForPublish', () => {
  const basePkg: Partial<Package> = {
    title: 'Valid Package Title',
    pricePerPerson: 1200,
    totalNights: 7,
    nightsMakkah: 4,
    nightsMadinah: 3,
    cancellationPolicy: 'Cancel 45+ days before departure for a full refund.',
    inclusions: { visa: true, flights: true, transfers: true, meals: false },
    roomOccupancyOptions: { single: false, double: true, triple: true, quad: false },
  };

  it('accepts a valid publishable package', () => {
    expect(validatePackageForPublish(basePkg)).toEqual({ valid: true });
  });

  it('rejects a missing cancellation policy', () => {
    expect(validatePackageForPublish({ ...basePkg, cancellationPolicy: undefined })).toEqual({
      valid: false,
      error: 'Cancellation policy is required',
    });
  });

  it('rejects a cancellation policy that is too short', () => {
    expect(validatePackageForPublish({ ...basePkg, cancellationPolicy: 'Short' })).toEqual({
      valid: false,
      error: 'Cancellation policy must be at least 10 characters',
    });
  });

  it('rejects missing inclusions', () => {
    expect(validatePackageForPublish({ ...basePkg, inclusions: undefined })).toEqual({
      valid: false,
      error: 'Inclusions are required to publish',
    });
  });

  it('rejects empty room occupancy options', () => {
    expect(
      validatePackageForPublish({
        ...basePkg,
        roomOccupancyOptions: { single: false, double: false, triple: false, quad: false },
      })
    ).toEqual({
      valid: false,
      error: 'At least one room occupancy option must be selected',
    });
  });

  it('rejects missing room occupancy options', () => {
    expect(validatePackageForPublish({ ...basePkg, roomOccupancyOptions: undefined })).toEqual({
      valid: false,
      error: 'At least one room occupancy option must be selected',
    });
  });

  it('inherits draft validation failures', () => {
    expect(validatePackageForPublish({ ...basePkg, title: '' })).toEqual({
      valid: false,
      error: 'Title is required',
    });
  });
});