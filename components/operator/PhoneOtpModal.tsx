'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  OverlayContent,
  OverlayHeader,
  OverlayTitle,
  OverlayFooter,
} from '@/components/ui/Overlay';

interface PhoneOtpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (phoneLastFour: string) => void;
  isSubmitting?: boolean;
}

export function PhoneOtpModal({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
}: PhoneOtpModalProps) {
  const [lastFour, setLastFour] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const digits = lastFour.replace(/\D/g, '');
    if (digits.length !== 4) {
      setError('Enter the last 4 digits of your verified phone number.');
      return;
    }
    setError('');
    onConfirm(digits);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setLastFour('');
      setError('');
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <OverlayContent>
        <OverlayHeader>
          <OverlayTitle>Confirm with your phone</OverlayTitle>
        </OverlayHeader>

        <p className="text-sm text-[var(--textMuted)]">
          To protect your payment details, confirm the last 4 digits of the phone number registered
          to your account.
        </p>

        <div className="space-y-1.5">
          <label htmlFor="otp-last-four" className="block text-sm font-medium text-[var(--text)]">
            Last 4 digits of your phone number
          </label>
          <input
            id="otp-last-four"
            type="text"
            inputMode="numeric"
            aria-label="Last 4 digits of verified phone number"
            autoComplete="one-time-code"
            maxLength={4}
            placeholder="••••"
            value={lastFour}
            onChange={(e) => {
              setLastFour(e.target.value.replace(/\D/g, '').slice(0, 4));
              if (error) setError('');
            }}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? 'otp-error' : undefined}
            className={`min-h-11 w-full rounded-md border bg-[var(--surfaceDark)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--textMuted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
              error
                ? 'border-[var(--danger)] focus-visible:outline-[var(--danger)]'
                : 'border-[var(--borderSubtle)] focus-visible:outline-[var(--focusRing)]'
            }`}
            data-testid="otp-input"
          />
          {error && (
            <p id="otp-error" role="alert" className="text-xs text-[var(--danger)]">
              {error}
            </p>
          )}
        </div>

        <p className="text-xs text-[var(--textMuted)]">
          This confirmation is recorded as part of the change audit log.
        </p>

        <OverlayFooter>
          <Button
            variant="secondary"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            loading={isSubmitting}
            disabled={isSubmitting}
            data-testid="confirm-otp-btn"
          >
            Confirm
          </Button>
        </OverlayFooter>
      </OverlayContent>
    </Dialog>
  );
}
