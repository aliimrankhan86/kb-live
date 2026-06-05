import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaymentInstructions } from '../components/request/PaymentInstructions';
import { MockDB } from '../lib/api/mock-db';
import { BookingIntent } from '../lib/types';

describe('PaymentInstructions component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows holding message when operator is Listed and not bookable', () => {
    const intent: BookingIntent = {
      id: 'bi-listed',
      referenceCode: 'KT-TEST-001',
      offerId: 'offer-listed',
      customerId: 'cust1',
      operatorId: 'op2',
      status: 'started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MockDB.saveBookingIntent(intent);

    render(<PaymentInstructions bookingIntent={intent} />);

    expect(screen.getByTestId('payment-instructions')).toBeInTheDocument();
    expect(screen.getByText(/not yet verified for direct payments/i)).toBeInTheDocument();
  });

  it('shows holding message for unauthorized customer', () => {
    const intent: BookingIntent = {
      id: 'bi-unauthorized',
      referenceCode: 'KT-TEST-002',
      offerId: 'offer-unauthorized',
      customerId: 'other-customer',
      operatorId: 'op1',
      status: 'started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MockDB.saveBookingIntent(intent);

    render(<PaymentInstructions bookingIntent={intent} />);

    expect(screen.getByTestId('payment-instructions')).toBeInTheDocument();
    expect(screen.getByText(/only available to the booking party/i)).toBeInTheDocument();
  });

  it('shows full bank details for Verified operator with matching BookingIntent', () => {
    const intent: BookingIntent = {
      id: 'bi-verified',
      referenceCode: 'KT-TEST-003',
      offerId: 'offer-verified',
      customerId: 'cust1',
      operatorId: 'op1',
      status: 'started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MockDB.saveBookingIntent(intent);

    render(<PaymentInstructions bookingIntent={intent} />);

    expect(screen.getByTestId('payment-instructions')).toBeInTheDocument();
    expect(screen.getByTestId('bank-account-holder')).toHaveTextContent('Al-Hidayah Travel Ltd');
    expect(screen.getByTestId('bank-sort-code')).toHaveTextContent('20-00-00');
    expect(screen.getByTestId('bank-account-number')).toHaveTextContent('12345678');
    expect(screen.getByTestId('bank-bank-name')).toHaveTextContent('Example Business Bank');
    expect(screen.getByTestId('payment-disclaimer')).toHaveTextContent(/You pay the operator directly/);
    expect(screen.getAllByText('KT-TEST-003')).toHaveLength(2);
    expect(screen.queryByTestId('recently-updated-warning')).not.toBeInTheDocument();
  });

  it('shows recently-updated warning when bank details were activated in the last 7 days', () => {
    const intent: BookingIntent = {
      id: 'bi-recent',
      referenceCode: 'KT-TEST-004',
      offerId: 'offer-recent',
      customerId: 'cust1',
      operatorId: 'op1',
      status: 'started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MockDB.saveBookingIntent(intent);

    MockDB.saveAuditLogEntry({
      id: 'audit-recent',
      action: 'bank_change.activated',
      actorUserId: 'admin1',
      actorRole: 'admin',
      operatorId: 'op1',
      targetType: 'bank_change_request',
      targetId: 'bcr-recent',
      createdAt: new Date().toISOString(),
    });

    render(<PaymentInstructions bookingIntent={intent} />);

    expect(screen.getByTestId('recently-updated-warning')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/recently updated/);
  });

  it('discloses pay-operator-direct copy exactly', () => {
    const intent: BookingIntent = {
      id: 'bi-disclosure',
      referenceCode: 'KT-TEST-005',
      offerId: 'offer-disclosure',
      customerId: 'cust1',
      operatorId: 'op1',
      status: 'started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MockDB.saveBookingIntent(intent);

    render(<PaymentInstructions bookingIntent={intent} />);

    const disclosure = screen.getByTestId('payment-disclaimer');
    expect(disclosure).toHaveTextContent(
      'You pay the operator directly. KaabaTrip does not collect, hold, or transfer customer funds. The operator is the contracting party and is responsible for package fulfilment, payment records, and any payment outcome.'
    );
  });
});