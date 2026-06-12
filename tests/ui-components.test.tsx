import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { InclusionChip } from '@/components/ui/InclusionChip';
import { InclusionChipList } from '@/components/ui/InclusionChip';

describe('VerifiedBadge', () => {
  it('renders with verified text', () => {
    render(<VerifiedBadge />);
    expect(screen.getByTestId('verified-badge')).toBeInTheDocument();
    expect(screen.getByTestId('verified-badge')).toHaveTextContent('Verified');
  });

  it('renders checkmark SVG (aria-hidden)', () => {
    render(<VerifiedBadge />);
    const badge = screen.getByTestId('verified-badge');
    const svg = badge.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  it('applies custom className', () => {
    render(<VerifiedBadge className="custom-class" />);
    expect(screen.getByTestId('verified-badge')).toHaveClass('custom-class');
  });

  it('has title attribute for accessibility', () => {
    render(<VerifiedBadge />);
    expect(screen.getByTestId('verified-badge')).toHaveAttribute('title', 'Verified operator');
  });
});

describe('InclusionChip', () => {
  it('renders included chip with correct label', () => {
    render(<InclusionChip chip={{ label: 'Visa', included: true }} />);
    const chip = screen.getByTestId('inclusion-chip-visa');
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveTextContent('Visa');
  });

  it('included chip has success token styling class', () => {
    render(<InclusionChip chip={{ label: 'Flights', included: true }} />);
    const chip = screen.getByTestId('inclusion-chip-flights');
    expect(chip.className).toContain('color-success');
  });

  it('excluded chip does not have success token styling', () => {
    render(<InclusionChip chip={{ label: 'Meals', included: false }} />);
    const chip = screen.getByTestId('inclusion-chip-meals');
    expect(chip.className).not.toContain('color-success');
  });

  it('renders checkmark symbol for included chip', () => {
    render(<InclusionChip chip={{ label: 'Transfers', included: true }} />);
    const chip = screen.getByTestId('inclusion-chip-transfers');
    expect(chip.textContent).toContain('✓');
  });

  it('testid uses lowercase label', () => {
    render(<InclusionChip chip={{ label: 'Visa', included: true }} />);
    expect(screen.getByTestId('inclusion-chip-visa')).toBeInTheDocument();
  });
});

describe('InclusionChipList', () => {
  const chips = [
    { label: 'Visa', included: true },
    { label: 'Flights', included: false },
    { label: 'Transfers', included: true },
    { label: 'Meals', included: false },
  ];

  it('renders correct number of chips', () => {
    render(<InclusionChipList chips={chips} />);
    expect(screen.getByTestId('inclusion-chip-visa')).toBeInTheDocument();
    expect(screen.getByTestId('inclusion-chip-flights')).toBeInTheDocument();
    expect(screen.getByTestId('inclusion-chip-transfers')).toBeInTheDocument();
    expect(screen.getByTestId('inclusion-chip-meals')).toBeInTheDocument();
  });

  it('renders 4 chips for standard inclusions', () => {
    render(<InclusionChipList chips={chips} />);
    // Each chip has a specific testid like inclusion-chip-visa, etc.
    expect(screen.getByTestId('inclusion-chip-visa')).toBeInTheDocument();
    expect(screen.getByTestId('inclusion-chip-flights')).toBeInTheDocument();
    expect(screen.getByTestId('inclusion-chip-transfers')).toBeInTheDocument();
    expect(screen.getByTestId('inclusion-chip-meals')).toBeInTheDocument();
  });

  it('applies custom data-testid to wrapper', () => {
    render(<InclusionChipList chips={chips} data-testid="my-chip-list" />);
    expect(screen.getByTestId('my-chip-list')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<InclusionChipList chips={chips} className="my-class" />);
    const container = document.querySelector('.my-class');
    expect(container).toBeInTheDocument();
  });

  it('renders empty list without crashing', () => {
    render(<InclusionChipList chips={[]} />);
    // Only the wrapper div should be present, no individual chip spans
    expect(screen.getByTestId('inclusion-chip-list')).toBeInTheDocument();
    expect(screen.queryByTestId('inclusion-chip-visa')).not.toBeInTheDocument();
  });
});
