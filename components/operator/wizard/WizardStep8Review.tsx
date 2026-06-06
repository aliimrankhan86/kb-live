'use client';

import type { Package } from '@/lib/types';

interface Props {
  data: Partial<Package>;
  onSaveDraft: () => void;
  onPublish: () => void;
  isSaving: boolean;
  error: string | null;
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-[rgba(255,255,255,0.06)] last:border-0">
      <span className="w-36 shrink-0 text-xs font-medium text-[var(--textMuted)] uppercase tracking-wide">{label}</span>
      <span className="text-sm text-[var(--text)]">{value ?? <span className="text-[var(--textMuted)] italic">Not set</span>}</span>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4">
      <h3 className="mb-3 text-xs font-semibold text-[var(--yellow)] uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

function yesNo(v: boolean | undefined) {
  return v ? 'Yes' : 'No';
}

export function WizardStep8Review({ data, onSaveDraft, onPublish, isSaving, error }: Props) {
  // Publish-blocking checks
  const missingForPublish: string[] = [];
  if (!data.cancellationPolicy || data.cancellationPolicy.length < 10) missingForPublish.push('Cancellation policy (Step 6)');
  if (!data.hotelMakkahName) missingForPublish.push('Makkah hotel name (Step 3)');
  if (!data.hotelMadinahName) missingForPublish.push('Madinah hotel name (Step 3)');

  const canPublish = missingForPublish.length === 0;

  const inclusions = data.inclusions;
  const occupancy = data.roomOccupancyOptions;
  const highlights = (data.highlights ?? []).filter(Boolean);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Review &amp; publish</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">Check all details before saving or publishing.</p>
      </div>

      {error && (
        <div role="alert" className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Publish-blocking warnings */}
      {missingForPublish.length > 0 && (
        <div className="rounded border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <p className="font-medium mb-1">Required to publish:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {missingForPublish.map((m) => <li key={m}>{m}</li>)}
          </ul>
          <p className="mt-1 text-xs opacity-80">You can still save as draft.</p>
        </div>
      )}

      {/* Step 1: Basics */}
      <ReviewSection title="Basics">
        <ReviewRow label="Title" value={data.title} />
        <ReviewRow label="Type" value={data.pilgrimageType} />
        <ReviewRow label="Season" value={data.seasonLabel} />
        <ReviewRow label="Departure from" value={data.dateWindow?.start} />
        <ReviewRow label="Return by" value={data.dateWindow?.end} />
      </ReviewSection>

      {/* Step 2: Pricing */}
      <ReviewSection title="Pricing">
        <ReviewRow label="Price/person" value={data.pricePerPerson != null ? `£${data.pricePerPerson.toLocaleString()}` : undefined} />
        <ReviewRow label="Price type" value={data.priceType} />
        <ReviewRow label="Deposit" value={data.depositAmount != null ? `£${data.depositAmount}` : 'None'} />
        <ReviewRow label="Payment plan" value={yesNo(data.paymentPlanAvailable)} />
      </ReviewSection>

      {/* Step 3: Hotels */}
      <ReviewSection title="Hotels">
        <ReviewRow label="Makkah hotel" value={data.hotelMakkahName} />
        <ReviewRow label="Makkah stars" value={data.hotelMakkahStars ? `${data.hotelMakkahStars}★` : undefined} />
        <ReviewRow label="Makkah nights" value={data.nightsMakkah} />
        <ReviewRow label="Makkah distance" value={data.distanceBandMakkah} />
        <ReviewRow label="Madinah hotel" value={data.hotelMadinahName} />
        <ReviewRow label="Madinah stars" value={data.hotelMadinahStars ? `${data.hotelMadinahStars}★` : undefined} />
        <ReviewRow label="Madinah nights" value={data.nightsMadinah} />
        <ReviewRow label="Madinah distance" value={data.distanceBandMadinah} />
        <ReviewRow label="Total nights" value={data.totalNights} />
      </ReviewSection>

      {/* Step 4: Flights */}
      <ReviewSection title="Flights">
        <ReviewRow label="Flights included" value={yesNo(data.inclusions?.flights)} />
        {data.inclusions?.flights && (
          <>
            <ReviewRow label="Airline" value={data.airline} />
            <ReviewRow label="Airport" value={data.departureAirport} />
            <ReviewRow label="Flight type" value={data.flightType} />
          </>
        )}
      </ReviewSection>

      {/* Step 5: Inclusions & rooms */}
      <ReviewSection title="Inclusions &amp; rooms">
        {inclusions && (
          <ReviewRow
            label="Included"
            value={
              Object.entries(inclusions)
                .filter(([, v]) => v)
                .map(([k]) => k)
                .join(', ') || 'None'
            }
          />
        )}
        {occupancy && (
          <ReviewRow
            label="Room types"
            value={
              Object.entries(occupancy)
                .filter(([, v]) => v)
                .map(([k]) => k)
                .join(', ') || 'None'
            }
          />
        )}
        <ReviewRow label="Group type" value={data.groupType} />
      </ReviewSection>

      {/* Step 6 & 7: Policies + Marketing */}
      <ReviewSection title="Policies &amp; marketing">
        <ReviewRow
          label="Cancel policy"
          value={
            data.cancellationPolicy
              ? data.cancellationPolicy.length > 100
                ? data.cancellationPolicy.slice(0, 100) + '…'
                : data.cancellationPolicy
              : undefined
          }
        />
        {highlights.length > 0 && (
          <ReviewRow label="Highlights" value={highlights.map((h, i) => <div key={i}>{h}</div>)} />
        )}
        <ReviewRow label="Image URL" value={data.imageUrl} />
        <ReviewRow
          label="Notes"
          value={
            data.notes
              ? data.notes.length > 80
                ? data.notes.slice(0, 80) + '…'
                : data.notes
              : undefined
          }
        />
      </ReviewSection>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <button
          type="button"
          data-testid="wizard-publish-btn"
          onClick={onPublish}
          disabled={!canPublish || isSaving}
          className="flex-1 rounded bg-[var(--yellow)] px-5 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Publishing…' : 'Publish package'}
        </button>
        <button
          type="button"
          data-testid="wizard-draft-btn"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="flex-1 rounded border border-[rgba(255,255,255,0.15)] px-5 py-2.5 text-sm font-medium text-[var(--textMuted)] hover:border-[rgba(255,255,255,0.3)] hover:text-[var(--text)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving…' : 'Save as draft'}
        </button>
      </div>
    </div>
  );
}
