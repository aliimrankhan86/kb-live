/**
 * Unit tests for the PackageWizard component and step validators.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Package } from '@/lib/types';

// ─── Import validators (pure functions — no render needed) ───────────────────
import { validateStep1 } from '@/components/operator/wizard/WizardStep1Basics';
import { validateStep2 } from '@/components/operator/wizard/WizardStep2Pricing';
import { validateStep3 } from '@/components/operator/wizard/WizardStep3Hotels';
import { validateStep4 } from '@/components/operator/wizard/WizardStep4Flights';
import { validateStep5 } from '@/components/operator/wizard/WizardStep5Inclusions';
import { validateStep6 } from '@/components/operator/wizard/WizardStep6Policies';
import { validateStep7 } from '@/components/operator/wizard/WizardStep7Marketing';

// ─── Import components ───────────────────────────────────────────────────────
import { WizardStep1Basics } from '@/components/operator/wizard/WizardStep1Basics';
import { WizardStep2Pricing } from '@/components/operator/wizard/WizardStep2Pricing';
import { WizardStep3Hotels } from '@/components/operator/wizard/WizardStep3Hotels';
import { WizardStep4Flights } from '@/components/operator/wizard/WizardStep4Flights';
import { WizardStep5Inclusions } from '@/components/operator/wizard/WizardStep5Inclusions';
import { WizardStep6Policies } from '@/components/operator/wizard/WizardStep6Policies';
import { WizardStep7Marketing } from '@/components/operator/wizard/WizardStep7Marketing';
import { PackageWizard } from '@/components/operator/wizard/PackageWizard';

// ─── Mock router (required by Next.js hooks) ─────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn() }),
}));

// ─── Minimal valid package data per step ─────────────────────────────────────
const validBasics: Partial<Package> = {
  title: 'Premium Umrah Package',
  pilgrimageType: 'umrah',
};

const validPricing: Partial<Package> = {
  ...validBasics,
  pricePerPerson: 1499,
  priceType: 'from',
};

const validHotels: Partial<Package> = {
  ...validPricing,
  nightsMakkah: 7,
  nightsMadinah: 4,
  totalNights: 11,
};

const validFull: Partial<Package> = {
  ...validHotels,
  inclusions: { visa: false, flights: false, transfers: false, meals: false },
  roomOccupancyOptions: { single: false, double: true, triple: true, quad: false },
  cancellationPolicy: 'Full refund if cancelled 60 days before departure.',
};

// ─── validateStep1 ────────────────────────────────────────────────────────────
describe('validateStep1', () => {
  it('passes valid data', () => {
    expect(validateStep1(validBasics)).toBeNull();
  });

  it('fails empty title', () => {
    expect(validateStep1({ pilgrimageType: 'umrah' })).toMatch(/required/i);
  });

  it('fails title too short', () => {
    expect(validateStep1({ title: 'abc', pilgrimageType: 'umrah' })).toMatch(/5 characters/i);
  });

  it('fails title over 120 chars', () => {
    expect(validateStep1({ title: 'a'.repeat(121), pilgrimageType: 'umrah' })).toMatch(/120/i);
  });

  it('fails missing pilgrimageType', () => {
    expect(validateStep1({ title: 'Valid Title Here' })).toMatch(/pilgrimage type/i);
  });
});

// ─── validateStep2 ────────────────────────────────────────────────────────────
describe('validateStep2', () => {
  it('passes valid data', () => {
    expect(validateStep2(validPricing)).toBeNull();
  });

  it('fails zero price', () => {
    expect(validateStep2({ pricePerPerson: 0, priceType: 'from' })).toMatch(/greater than 0/i);
  });

  it('fails negative price', () => {
    expect(validateStep2({ pricePerPerson: -10, priceType: 'from' })).toMatch(/greater than 0/i);
  });

  it('fails missing priceType', () => {
    expect(validateStep2({ pricePerPerson: 1000 })).toMatch(/price type/i);
  });
});

// ─── validateStep3 ────────────────────────────────────────────────────────────
describe('validateStep3', () => {
  it('passes valid data', () => {
    expect(validateStep3(validHotels)).toBeNull();
  });

  it('fails zero Makkah nights', () => {
    expect(validateStep3({ nightsMakkah: 0, nightsMadinah: 3 })).toMatch(/makkah/i);
  });

  it('fails zero Madinah nights', () => {
    expect(validateStep3({ nightsMakkah: 5, nightsMadinah: 0 })).toMatch(/madinah/i);
  });

  it('fails missing nights', () => {
    expect(validateStep3({})).toMatch(/makkah/i);
  });
});

// ─── validateStep4 ────────────────────────────────────────────────────────────
describe('validateStep4', () => {
  it('always passes — flights optional', () => {
    expect(validateStep4({})).toBeNull();
    expect(validateStep4({ inclusions: { visa: false, flights: true, transfers: false, meals: false } })).toBeNull();
  });
});

// ─── validateStep5 ────────────────────────────────────────────────────────────
describe('validateStep5', () => {
  it('passes when at least one room type selected', () => {
    expect(validateStep5({
      roomOccupancyOptions: { single: false, double: true, triple: false, quad: false },
    })).toBeNull();
  });

  it('fails when no room types selected', () => {
    expect(validateStep5({
      roomOccupancyOptions: { single: false, double: false, triple: false, quad: false },
    })).toMatch(/at least one room/i);
  });

  it('passes when roomOccupancyOptions not set (no constraint on missing data)', () => {
    // If occ is undefined, no hard error — validateStep5 guards only when occ is set and all false
    expect(validateStep5({})).toBeNull();
  });
});

// ─── validateStep6 ────────────────────────────────────────────────────────────
describe('validateStep6', () => {
  it('always passes — cancellation policy enforced at publish time only', () => {
    expect(validateStep6({})).toBeNull();
    expect(validateStep6({ cancellationPolicy: '' })).toBeNull();
  });
});

// ─── validateStep7 ────────────────────────────────────────────────────────────
describe('validateStep7', () => {
  it('passes empty data', () => {
    expect(validateStep7({})).toBeNull();
  });

  it('fails notes over 2000 chars', () => {
    expect(validateStep7({ notes: 'a'.repeat(2001) })).toMatch(/2000/i);
  });

  it('fails invalid image URL', () => {
    expect(validateStep7({ images: ['not-a-url'] })).toMatch(/http/i);
  });

  it('passes valid https image URLs', () => {
    expect(validateStep7({ images: ['https://example.com/img.jpg'] })).toBeNull();
  });
});

// ─── WizardStep1Basics render ─────────────────────────────────────────────────
describe('WizardStep1Basics', () => {
  it('renders required fields', () => {
    render(<WizardStep1Basics data={{}} onChange={vi.fn()} error={null} />);
    expect(screen.getByTestId('wizard-title')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-type')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-season')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-date-start')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-date-end')).toBeInTheDocument();
  });

  it('shows error when provided', () => {
    render(<WizardStep1Basics data={{}} onChange={vi.fn()} error="Title is required." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Title is required.');
  });

  it('calls onChange when title changes', () => {
    const onChange = vi.fn();
    render(<WizardStep1Basics data={{}} onChange={onChange} error={null} />);
    fireEvent.change(screen.getByTestId('wizard-title'), { target: { value: 'My Package' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ title: 'My Package' }));
  });
});

// ─── WizardStep2Pricing render ────────────────────────────────────────────────
describe('WizardStep2Pricing', () => {
  it('renders pricing fields', () => {
    render(<WizardStep2Pricing data={{}} onChange={vi.fn()} error={null} />);
    expect(screen.getByTestId('wizard-price')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-price-type')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-deposit')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-payment-plan')).toBeInTheDocument();
  });

  it('GBP display-only currency shown (C8 constraint)', () => {
    render(<WizardStep2Pricing data={{}} onChange={vi.fn()} error={null} />);
    expect(screen.getByText(/GBP/)).toBeInTheDocument();
  });
});

// ─── WizardStep3Hotels render ─────────────────────────────────────────────────
describe('WizardStep3Hotels', () => {
  it('renders Makkah and Madinah sections', () => {
    render(<WizardStep3Hotels data={{}} onChange={vi.fn()} error={null} />);
    expect(screen.getByTestId('makkah-name')).toBeInTheDocument();
    expect(screen.getByTestId('madinah-name')).toBeInTheDocument();
    expect(screen.getByTestId('makkah-nights')).toBeInTheDocument();
    expect(screen.getByTestId('madinah-nights')).toBeInTheDocument();
  });

  it('shows total nights computed from data', () => {
    render(<WizardStep3Hotels data={{ nightsMakkah: 7, nightsMadinah: 4 }} onChange={vi.fn()} error={null} />);
    expect(screen.getByTestId('total-nights')).toHaveTextContent('11');
  });
});

// ─── WizardStep4Flights render ────────────────────────────────────────────────
describe('WizardStep4Flights', () => {
  it('renders flights toggle', () => {
    render(<WizardStep4Flights data={{}} onChange={vi.fn()} error={null} />);
    expect(screen.getByTestId('wizard-flights-toggle')).toBeInTheDocument();
  });

  it('hides airline/airport when flights not included', () => {
    render(<WizardStep4Flights data={{}} onChange={vi.fn()} error={null} />);
    expect(screen.queryByTestId('wizard-airline')).not.toBeInTheDocument();
  });

  it('shows airline/airport when flights included', () => {
    render(<WizardStep4Flights
      data={{ inclusions: { visa: false, flights: true, transfers: false, meals: false } }}
      onChange={vi.fn()}
      error={null}
    />);
    expect(screen.getByTestId('wizard-airline')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-airport')).toBeInTheDocument();
  });
});

// ─── WizardStep5Inclusions render ─────────────────────────────────────────────
describe('WizardStep5Inclusions', () => {
  it('renders all inclusion checkboxes', () => {
    render(<WizardStep5Inclusions data={{}} onChange={vi.fn()} error={null} />);
    expect(screen.getByTestId('wizard-inclusion-visa')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-inclusion-flights')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-inclusion-transfers')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-inclusion-meals')).toBeInTheDocument();
  });

  it('renders all room type toggles', () => {
    render(<WizardStep5Inclusions data={{}} onChange={vi.fn()} error={null} />);
    expect(screen.getByTestId('wizard-room-single')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-room-double')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-room-triple')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-room-quad')).toBeInTheDocument();
  });
});

// ─── WizardStep6Policies render ───────────────────────────────────────────────
describe('WizardStep6Policies', () => {
  it('renders cancellation policy textarea', () => {
    render(<WizardStep6Policies data={{}} onChange={vi.fn()} error={null} />);
    expect(screen.getByTestId('wizard-cancellation-policy')).toBeInTheDocument();
  });

  it('renders group type options', () => {
    render(<WizardStep6Policies data={{}} onChange={vi.fn()} error={null} />);
    expect(screen.getByTestId('wizard-group-private')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-group-small-group')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-group-large-group')).toBeInTheDocument();
  });
});

// ─── WizardStep7Marketing render ──────────────────────────────────────────────
describe('WizardStep7Marketing', () => {
  it('renders highlights input', () => {
    render(<WizardStep7Marketing data={{}} onChange={vi.fn()} error={null} />);
    expect(screen.getByTestId('wizard-highlight-0')).toBeInTheDocument();
  });

  it('renders image upload and notes fields', () => {
    render(<WizardStep7Marketing data={{}} onChange={vi.fn()} error={null} />);
    expect(screen.getByTestId('wizard-image-upload')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-notes')).toBeInTheDocument();
  });

  it('shows add highlight button when under limit', () => {
    render(<WizardStep7Marketing data={{}} onChange={vi.fn()} error={null} />);
    expect(screen.getByTestId('wizard-add-highlight')).toBeInTheDocument();
  });
});

// ─── PackageWizard orchestrator ───────────────────────────────────────────────
describe('PackageWizard', () => {
  it('renders step 1 by default', () => {
    render(<PackageWizard />);
    expect(screen.getByTestId('wizard-title')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 8')).toBeInTheDocument();
  });

  it('shows Next and Back buttons on step 1', () => {
    render(<PackageWizard />);
    expect(screen.getByTestId('wizard-next-btn')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-back-btn')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-back-btn')).toBeDisabled();
  });

  it('does not advance to step 2 without valid title', async () => {
    render(<PackageWizard />);
    fireEvent.click(screen.getByTestId('wizard-next-btn'));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    // Still on step 1
    expect(screen.getByTestId('wizard-title')).toBeInTheDocument();
  });

  it('advances to step 2 with valid basics', async () => {
    render(<PackageWizard />);
    fireEvent.change(screen.getByTestId('wizard-title'), { target: { value: 'Valid Package Title' } });
    fireEvent.click(screen.getByTestId('wizard-next-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('wizard-price')).toBeInTheDocument();
      expect(screen.getByText('Step 2 of 8')).toBeInTheDocument();
    });
  });

  it('goes back to step 1 from step 2', async () => {
    render(<PackageWizard />);
    // Advance to step 2
    fireEvent.change(screen.getByTestId('wizard-title'), { target: { value: 'Valid Package Title' } });
    fireEvent.click(screen.getByTestId('wizard-next-btn'));
    await waitFor(() => expect(screen.getByTestId('wizard-price')).toBeInTheDocument());
    // Back to step 1
    fireEvent.click(screen.getByTestId('wizard-back-btn'));
    await waitFor(() => expect(screen.getByTestId('wizard-title')).toBeInTheDocument());
  });

  it('renders step breadcrumb nav buttons', () => {
    render(<PackageWizard />);
    expect(screen.getByTestId('wizard-step-nav-0')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-step-nav-7')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(<PackageWizard onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('initialises with provided data in edit mode', () => {
    render(<PackageWizard initialData={{ title: 'Existing Package Title', pilgrimageType: 'hajj' }} />);
    expect(screen.getByTestId('wizard-title')).toHaveValue('Existing Package Title');
  });
});
