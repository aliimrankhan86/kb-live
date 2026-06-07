'use client';

import { useState } from 'react';
import type { Package } from '@/lib/types';

import { WizardStep1Basics, validateStep1 } from './WizardStep1Basics';
import { WizardStep2Pricing, validateStep2 } from './WizardStep2Pricing';
import { WizardStep3Hotels, validateStep3 } from './WizardStep3Hotels';
import { WizardStep4Flights, validateStep4 } from './WizardStep4Flights';
import { WizardStep5Inclusions, validateStep5 } from './WizardStep5Inclusions';
import { WizardStep6Policies, validateStep6 } from './WizardStep6Policies';
import { WizardStep7Marketing, validateStep7 } from './WizardStep7Marketing';
import { WizardStep8Review } from './WizardStep8Review';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  /** Existing package for edit mode. Omit for create mode. */
  initialData?: Partial<Package>;
  onSuccess?: (pkg: Package) => void;
  onCancel?: () => void;
}

const STEPS = [
  'Basics',
  'Pricing',
  'Hotels',
  'Flights',
  'Inclusions',
  'Policies',
  'Marketing',
  'Review',
] as const;

type StepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

const VALIDATORS: ((data: Partial<Package>) => string | null)[] = [
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
  validateStep6,
  validateStep7,
  () => null, // Step 8 has no pre-submit validator
];

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_DATA: Partial<Package> = {
  pilgrimageType: 'umrah',
  priceType: 'from',
  currency: 'GBP',
  inclusions: { visa: false, flights: false, transfers: false, meals: false },
  roomOccupancyOptions: { single: false, double: true, triple: true, quad: true },
  distanceBandMakkah: 'medium',
  distanceBandMadinah: 'medium',
  groupType: 'small-group',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function PackageWizard({ initialData, onSuccess, onCancel }: Props) {
  const [step, setStep] = useState<StepIndex>(0);
  const [data, setData] = useState<Partial<Package>>({ ...DEFAULT_DATA, ...initialData });
  const [errors, setErrors] = useState<(string | null)[]>(new Array(STEPS.length).fill(null));
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditMode = Boolean(initialData?.id);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const updateData = (updates: Partial<Package>) => {
    setData((prev) => ({ ...prev, ...updates }));
    // Clear error for current step when user edits
    setErrors((prev) => {
      const next = [...prev];
      next[step] = null;
      return next;
    });
  };

  const setStepError = (idx: number, msg: string | null) => {
    setErrors((prev) => {
      const next = [...prev];
      next[idx] = msg;
      return next;
    });
  };

  // ── Navigation ───────────────────────────────────────────────────────────────

  const goNext = () => {
    const err = VALIDATORS[step](data);
    if (err) {
      setStepError(step, err);
      return;
    }
    setStepError(step, null);
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1) as StepIndex);
  };

  const goBack = () => {
    setStep((prev) => Math.max(prev - 1, 0) as StepIndex);
  };

  const jumpTo = (target: StepIndex) => {
    // Only allow jumping to completed (validated) steps or current
    if (target >= step) {
      // Validate all steps up to target before jumping forward
      for (let i = step; i < target; i++) {
        const err = VALIDATORS[i](data);
        if (err) {
          setStepError(i, err);
          setStep(i as StepIndex);
          return;
        }
      }
    }
    setStep(target);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const submit = async (status: 'draft' | 'published') => {
    setSubmitError(null);
    setIsSaving(true);

    // Run all validators before submitting
    for (let i = 0; i < VALIDATORS.length - 1; i++) {
      const err = VALIDATORS[i](data);
      if (err) {
        setStepError(i, err);
        setStep(i as StepIndex);
        setIsSaving(false);
        return;
      }
    }

    try {
      const payload = { ...data, status };

      let response: Response;

      if (isEditMode && initialData?.id) {
        response = await fetch('/api/operator/packages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: initialData.id }),
        });
      } else {
        response = await fetch('/api/operator/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error || `Server error ${response.status}`);
      }

      const json = await response.json() as { package: Package };
      onSuccess?.(json.package);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save package');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Progress bar ─────────────────────────────────────────────────────────────

  const progressPct = ((step + 1) / STEPS.length) * 100;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-2xl mx-auto" data-testid="package-wizard">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-[var(--textMuted)]">
            Step {step + 1} of {STEPS.length}
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-[var(--textMuted)] hover:text-[var(--text)] transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-[rgba(255,255,255,0.08)]">
          <div
            className="h-1.5 rounded-full bg-[var(--yellow)] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Step breadcrumbs */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              data-testid={`wizard-step-nav-${i}`}
              onClick={() => jumpTo(i as StepIndex)}
              className={`rounded px-2.5 py-1 text-xs transition-colors ${
                i === step
                  ? 'bg-[var(--yellow)] text-black font-semibold'
                  : i < step
                  ? errors[i]
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-[rgba(255,255,255,0.1)] text-[var(--text)] hover:bg-[rgba(255,255,255,0.15)]'
                  : 'bg-[rgba(255,255,255,0.04)] text-[var(--textMuted)] hover:bg-[rgba(255,255,255,0.08)]'
              }`}
            >
              {i + 1}. {label}
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="mb-6">
        {step === 0 && (
          <WizardStep1Basics data={data} onChange={updateData} error={errors[0]} />
        )}
        {step === 1 && (
          <WizardStep2Pricing data={data} onChange={updateData} error={errors[1]} />
        )}
        {step === 2 && (
          <WizardStep3Hotels data={data} onChange={updateData} error={errors[2]} />
        )}
        {step === 3 && (
          <WizardStep4Flights data={data} onChange={updateData} error={errors[3]} />
        )}
        {step === 4 && (
          <WizardStep5Inclusions data={data} onChange={updateData} error={errors[4]} />
        )}
        {step === 5 && (
          <WizardStep6Policies data={data} onChange={updateData} error={errors[5]} />
        )}
        {step === 6 && (
          <WizardStep7Marketing data={data} onChange={updateData} error={errors[6]} />
        )}
        {step === 7 && (
          <WizardStep8Review
            data={data}
            onSaveDraft={() => submit('draft')}
            onPublish={() => submit('published')}
            isSaving={isSaving}
            error={submitError}
          />
        )}
      </div>

      {/* Navigation footer — hidden on final review step (Step 8 has its own buttons) */}
      {step < 7 && (
        <div className="flex items-center justify-between gap-3 border-t border-[rgba(255,255,255,0.08)] pt-5">
          <button
            type="button"
            data-testid="wizard-back-btn"
            onClick={goBack}
            disabled={step === 0}
            className="rounded border border-[rgba(255,255,255,0.15)] px-5 py-2 text-sm text-[var(--textMuted)] hover:border-[rgba(255,255,255,0.3)] hover:text-[var(--text)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            type="button"
            data-testid="wizard-next-btn"
            onClick={goNext}
            className="rounded bg-[var(--yellow)] px-6 py-2 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
