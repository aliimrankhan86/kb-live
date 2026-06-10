import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PaymentInstructions } from '../components/request/PaymentInstructions';
import type { BookingIntent, PaymentInstructions as PaymentInstructionsType } from '../lib/types';

const baseIntent = (overrides: Partial<BookingIntent> = {}): BookingIntent => ({
  id: 'bi-test',
  referenceCode: 'KT-TEST-001',
  offerId: 'offer-1',
  customerId: 'cust1',
  operatorId: 'op1',
  status: 'started',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const mockInstructions: PaymentInstructionsType = {
  bookingIntentId: 'bi-test',
  operatorId: 'op1',
  operatorName: 'Al-Hidayah Travel Ltd',
  paymentDetailsId: 'pd-1',
  accountHolderName: 'Al-Hidayah Travel Ltd',
  bankName: 'Example Business Bank',
  sortCode: '20-00-00',
  accountNumber: '12345678',
  currency: 'GBP',
  country: 'GB',
  disclosure: 'You pay the operator directly.',
  delivery: 'in_app_only',
};

function mockFetch(response: { ok: boolean; body: unknown }) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: response.ok,
      json: () => Promise.resolve(response.body),
    }),
  );
}

describe('PaymentInstructions component', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows holding message when operator is not eligible', async () => {
    mockFetch({ ok: false, body: { error: 'Operator is not eligible to receive bookings' } });

    render(<PaymentInstructions bookingIntent={baseIntent()} />);

    await waitFor(() => {
      expect(screen.getByTestId('payment-instructions')).toBeInTheDocument();
      expect(screen.getByText(/not yet verified for direct payments/i)).toBeInTheDocument();
    });
  });

  it('shows holding message for unauthorized customer', async () => {
    mockFetch({ ok: false, body: { error: 'Unauthorized' } });

    render(<PaymentInstructions bookingIntent={baseIntent({ id: 'bi-unauth' })} />);

    await waitFor(() => {
      expect(screen.getByTestId('payment-instructions')).toBeInTheDocument();
      expect(screen.getByText(/only available to the booking party/i)).toBeInTheDocument();
    });
  });

  it('shows full bank details for verified operator', async () => {
    mockFetch({ ok: true, body: { instructions: mockInstructions } });

    const intent = baseIntent({ referenceCode: 'KT-TEST-003' });
    render(<PaymentInstructions bookingIntent={intent} />);

    await waitFor(() => {
      expect(screen.getByTestId('payment-instructions')).toBeInTheDocument();
      expect(screen.getByTestId('bank-account-holder')).toHaveTextContent('Al-Hidayah Travel Ltd');
      expect(screen.getByTestId('bank-sort-code')).toHaveTextContent('20-00-00');
      expect(screen.getByTestId('bank-account-number')).toHaveTextContent('12345678');
      expect(screen.getByTestId('bank-bank-name')).toHaveTextContent('Example Business Bank');
      expect(screen.getByTestId('payment-disclaimer')).toHaveTextContent(/You pay the operator directly/);
      expect(screen.getAllByText('KT-TEST-003')).toHaveLength(2);
    });
  });

  it('discloses pay-operator-direct copy exactly', async () => {
    mockFetch({ ok: true, body: { instructions: mockInstructions } });

    render(<PaymentInstructions bookingIntent={baseIntent()} />);

    await waitFor(() => {
      const disclosure = screen.getByTestId('payment-disclaimer');
      expect(disclosure).toHaveTextContent(
        'You pay the operator directly. KaabaTrip does not collect, hold, or transfer customer funds. The operator is the contracting party and is responsible for package fulfilment, payment records, and any payment outcome.',
      );
    });
  });
});
