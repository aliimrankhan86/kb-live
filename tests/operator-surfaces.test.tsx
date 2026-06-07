import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OperatorRegistrationForm } from '@/components/operator/OperatorRegistrationForm';
import { OperatorProfileForm } from '@/components/operator/OperatorProfileForm';
import { MockDB } from '@/lib/api/mock-db';
import { Repository } from '@/lib/api/repository';
import { OperatorProfile } from '@/lib/types';

// Mock router
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn() }),
}));

describe('OperatorRegistrationForm', () => {
  beforeEach(() => {
    MockDB.setCurrentUser('operator');
  });

  it('renders all required fields', () => {
    render(<OperatorRegistrationForm />);
    expect(screen.getByTestId('reg-company-name')).toBeInTheDocument();
    expect(screen.getByTestId('reg-email')).toBeInTheDocument();
    expect(screen.getByTestId('reg-phone')).toBeInTheDocument();
    expect(screen.getByTestId('reg-address-line1')).toBeInTheDocument();
    expect(screen.getByTestId('reg-city')).toBeInTheDocument();
    expect(screen.getByTestId('reg-postcode')).toBeInTheDocument();
    expect(screen.getByTestId('reg-country')).toBeInTheDocument();
    expect(screen.getByTestId('reg-submit')).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    render(<OperatorRegistrationForm />);
    fireEvent.click(screen.getByTestId('reg-submit'));
    await waitFor(() => {
      expect(screen.getByText(/Company name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Contact email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Contact phone is required/i)).toBeInTheDocument();
    });
  });

  it('shows email format error', async () => {
    render(<OperatorRegistrationForm />);
    fireEvent.change(screen.getByTestId('reg-email'), { target: { value: 'invalid' } });
    fireEvent.click(screen.getByTestId('reg-submit'));
    await waitFor(() => {
      expect(screen.getByText(/Enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('validates pilgrimage types selection', async () => {
    render(<OperatorRegistrationForm />);
    fireEvent.click(screen.getByTestId('reg-submit'));
    await waitFor(() => {
      expect(screen.getByText(/Select at least one pilgrimage type/i)).toBeInTheDocument();
    });
  });
});

describe('OperatorProfileForm', () => {
  const mockOperator: OperatorProfile = {
    id: 'op-test',
    companyName: 'Test Travel',
    contactEmail: 'test@example.com',
    verificationStatus: 'verified',
    tier: 'verified',
    contactPhone: '+44 123',
    officeAddress: { line1: '1 Main St', city: 'London', postcode: 'E1 1AA', country: 'GB' },
    servingRegions: ['UK'],
    pilgrimageTypesOffered: ['umrah'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    MockDB.setCurrentUser('operator');
  });

  it('renders profile form with operator data', () => {
    render(<OperatorProfileForm operator={mockOperator} />);
    expect(screen.getByTestId('profile-company-name')).toHaveValue('Test Travel');
    expect(screen.getByTestId('profile-email')).toHaveValue('test@example.com');
    expect(screen.getByTestId('profile-save')).toBeInTheDocument();
  });

  it('shows completeness score', () => {
    render(<OperatorProfileForm operator={mockOperator} />);
    expect(screen.getByText(/\d+%/)).toBeInTheDocument();
  });

  it('saves updated profile', async () => {
    // Seed the operator into MockDB so updateOperator can find it
    MockDB.saveOperator(mockOperator);
    render(<OperatorProfileForm operator={mockOperator} />);
    fireEvent.change(screen.getByTestId('profile-company-name'), { target: { value: 'Updated Travel' } });
    fireEvent.click(screen.getByTestId('profile-save'));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/Saved successfully/i);
    });
  });
});

describe('Repository.createOperator', () => {
  beforeEach(() => {
    MockDB.setCurrentUser('operator');
  });

  it('creates operator with pending status', async () => {
    const ctx = { userId: 'new-op-123', role: 'operator' as const };
    const op = await Repository.createOperator(ctx, {
      companyName: 'New Operator',
      contactEmail: 'new@example.com',
      contactPhone: '+44 999',
      officeAddress: { line1: '1 St', city: 'London', postcode: 'E1', country: 'GB' },
    });
    expect(op.id).toBe('new-op-123');
    expect(op.verificationStatus).toBe('pending');
    expect(op.tier).toBe('listed');
    expect(op.eligibilityFlags?.canReceiveBookings).toBe(false);
  });
});

describe('Repository.updateOperator', () => {
  beforeEach(() => {
    MockDB.setCurrentUser('operator');
  });

  it('updates operator fields', async () => {
    const ctx = { userId: 'op1', role: 'operator' as const };
    const updated = await Repository.updateOperator(ctx, 'op1', { companyName: 'Updated Name' });
    expect(updated.companyName).toBe('Updated Name');
    expect(updated.id).toBe('op1');
  });

  it('blocks unauthorized updates', async () => {
    const ctx = { userId: 'other', role: 'operator' as const };
    await expect(Repository.updateOperator(ctx, 'op1', { companyName: 'Hacked' })).rejects.toThrow('Unauthorized');
  });
});