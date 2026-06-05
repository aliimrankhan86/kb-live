'use client';

import { useState, useId } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { PaymentDetailsInput } from '@/lib/types';

interface BankDetailsFormProps {
  onSubmit: (details: PaymentDetailsInput) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  currentDetails?: Pick<PaymentDetailsInput, 'accountHolderName' | 'sortCode' | 'accountNumber'> | null;
}

const formatSortCode = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 6);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
};

export function BankDetailsForm({
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Continue',
  currentDetails,
}: BankDetailsFormProps) {
  const [accountHolderName, setAccountHolderName] = useState('');
  const [sortCode, setSortCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [errors, setErrors] = useState<Partial<Record<'accountHolderName' | 'sortCode' | 'accountNumber' | 'bankName', string>>>({});

  const scId = useId();
  const anId = useId();

  const clearError = (field: string) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (accountHolderName.trim().length < 2)
      next.accountHolderName = 'Account holder name required (minimum 2 characters).';
    if (sortCode.replace(/\D/g, '').length !== 6)
      next.sortCode = 'Sort code must be exactly 6 digits.';
    if (accountNumber.replace(/\D/g, '').length !== 8)
      next.accountNumber = 'Account number must be exactly 8 digits.';
    if (!bankName.trim())
      next.bankName = 'Bank name is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      accountHolderName: accountHolderName.trim(),
      sortCode: sortCode.trim(),
      accountNumber: accountNumber.trim(),
      bankName: bankName.trim(),
      currency: 'GBP',
      country: 'GB',
    });
  };

  const inputBase =
    'min-h-11 w-full rounded-md border bg-[var(--surfaceDark)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--textMuted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
  const inputOk = 'border-[var(--borderSubtle)] hover:border-[var(--borderStrong)] focus-visible:outline-[var(--focusRing)]';
  const inputErr = 'border-[var(--danger)] focus-visible:outline-[var(--danger)]';

  return (
    <form onSubmit={handleSubmit} noValidate data-testid="bank-details-form" className="space-y-5">
      {currentDetails && (
        <div className="rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.04)] p-3 text-sm">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--textMuted)]">
            Current details (for reference)
          </p>
          <p className="text-[var(--text)]">{currentDetails.accountHolderName}</p>
          <p className="text-[var(--textMuted)]">
            {currentDetails.sortCode.slice(0, -2)}**&ensp;&middot;&ensp;
            ****{currentDetails.accountNumber.slice(-4)}
          </p>
        </div>
      )}

      <div className="rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.03)] p-3 text-sm text-[var(--textMuted)] leading-relaxed space-y-1">
        <p>
          Your payment details are only shown to customers with a confirmed booking intent — never
          publicly, and never by email. Customers receive a link to view them securely in the app.
        </p>
        <p>The account name must match your registered business or trading name.</p>
      </div>

      <Input
        label="Account holder name"
        placeholder="e.g. Al-Hidayah Travel Ltd"
        value={accountHolderName}
        onChange={(e) => { setAccountHolderName(e.target.value); clearError('accountHolderName'); }}
        errorMessage={errors.accountHolderName}
        hasError={Boolean(errors.accountHolderName)}
        autoComplete="organization"
        data-testid="account-holder-name-input"
        required
      />

      <div className="space-y-1.5">
        <label htmlFor={scId} className="block text-sm font-medium text-[var(--text)]">
          Sort code
        </label>
        <input
          id={scId}
          type="text"
          inputMode="numeric"
          aria-label="Sort code, 6 digits"
          placeholder="20-00-00"
          value={sortCode}
          onChange={(e) => {
            setSortCode(formatSortCode(e.target.value));
            clearError('sortCode');
          }}
          aria-invalid={Boolean(errors.sortCode) || undefined}
          aria-describedby={errors.sortCode ? `${scId}-error` : `${scId}-help`}
          className={`${inputBase} ${errors.sortCode ? inputErr : inputOk}`}
          data-testid="sort-code-input"
          autoComplete="off"
        />
        {errors.sortCode ? (
          <p id={`${scId}-error`} role="alert" className="text-xs text-[var(--danger)]">
            {errors.sortCode}
          </p>
        ) : (
          <p id={`${scId}-help`} className="text-xs text-[var(--textMuted)]">
            6 digits — formatted automatically (e.g. 20-00-00)
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={anId} className="block text-sm font-medium text-[var(--text)]">
          Account number
        </label>
        <input
          id={anId}
          type="text"
          inputMode="numeric"
          aria-label="Account number, 8 digits"
          placeholder="12345678"
          value={accountNumber}
          onChange={(e) => {
            setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 8));
            clearError('accountNumber');
          }}
          maxLength={8}
          aria-invalid={Boolean(errors.accountNumber) || undefined}
          aria-describedby={errors.accountNumber ? `${anId}-error` : `${anId}-help`}
          className={`${inputBase} ${errors.accountNumber ? inputErr : inputOk}`}
          data-testid="account-number-input"
          autoComplete="off"
        />
        {errors.accountNumber ? (
          <p id={`${anId}-error`} role="alert" className="text-xs text-[var(--danger)]">
            {errors.accountNumber}
          </p>
        ) : (
          <p id={`${anId}-help`} className="text-xs text-[var(--textMuted)]">
            8 digits
          </p>
        )}
      </div>

      <Input
        label="Bank name"
        placeholder="e.g. Barclays"
        value={bankName}
        onChange={(e) => { setBankName(e.target.value); clearError('bankName'); }}
        errorMessage={errors.bankName}
        hasError={Boolean(errors.bankName)}
        helperText={!errors.bankName ? 'Display label — not used for payment processing' : undefined}
        data-testid="bank-name-input"
        required
      />

      <Button
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
        className="w-full"
        data-testid="submit-bank-details"
      >
        {submitLabel}
      </Button>
    </form>
  );
}
