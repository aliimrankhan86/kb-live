'use client';

import type { Package } from '@/lib/types';

interface Props {
  data: Partial<Package>;
  onChange: (updates: Partial<Package>) => void;
  error: string | null;
}

const MAX_HIGHLIGHTS = 5;

export function WizardStep7Marketing({ data, onChange, error }: Props) {
  const highlights = data.highlights ?? [''];
  const notes = data.notes ?? '';
  const imageUrl = data.imageUrl ?? '';

  const updateHighlight = (index: number, value: string) => {
    const next = [...highlights];
    next[index] = value;
    onChange({ highlights: next.filter((h, i) => h.trim() !== '' || i === 0) });
  };

  const addHighlight = () => {
    if (highlights.length < MAX_HIGHLIGHTS) {
      onChange({ highlights: [...highlights, ''] });
    }
  };

  const removeHighlight = (index: number) => {
    const next = highlights.filter((_, i) => i !== index);
    onChange({ highlights: next.length > 0 ? next : [''] });
  };

  // Ensure at least one highlight input shown
  const displayHighlights = highlights.length > 0 ? highlights : [''];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Marketing &amp; media</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">Add package highlights, additional notes, and a cover image URL.</p>
      </div>

      {error && (
        <div role="alert" className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Highlights */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wide">
            Package highlights
            <span className="ml-1.5 text-xs font-normal text-[var(--textMuted)] normal-case tracking-normal">
              (up to {MAX_HIGHLIGHTS})
            </span>
          </h3>
        </div>
        <div className="space-y-2">
          {displayHighlights.map((h, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                data-testid={`wizard-highlight-${i}`}
                placeholder={`e.g. ${i === 0 ? '5-star hotel 200m from Haram' : i === 1 ? 'Visa processing included' : 'Highlight ' + (i + 1)}`}
                value={h}
                onChange={(e) => updateHighlight(i, e.target.value)}
                className="flex-1 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--textMuted)] focus:border-[var(--yellow)] focus:outline-none"
              />
              {displayHighlights.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeHighlight(i)}
                  aria-label={`Remove highlight ${i + 1}`}
                  className="flex h-8 w-8 items-center justify-center rounded border border-[rgba(255,255,255,0.1)] text-[var(--textMuted)] hover:border-red-500/50 hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        {displayHighlights.length < MAX_HIGHLIGHTS && (
          <button
            type="button"
            data-testid="wizard-add-highlight"
            onClick={addHighlight}
            className="mt-2 text-xs text-[var(--yellow)] hover:underline"
          >
            + Add highlight
          </button>
        )}
      </div>

      {/* Cover image URL */}
      <div>
        <label htmlFor="pkg-image-url" className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">
          Cover image URL <span className="text-xs font-normal">(optional)</span>
        </label>
        <input
          id="pkg-image-url"
          type="url"
          data-testid="wizard-image-url"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => onChange({ imageUrl: e.target.value || undefined })}
          className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--textMuted)] focus:border-[var(--yellow)] focus:outline-none"
        />
        <p className="mt-1 text-xs text-[var(--textMuted)]">Direct link to a hosted image. Leave blank to use a placeholder.</p>
      </div>

      {/* Additional notes */}
      <div>
        <label htmlFor="pkg-notes" className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">
          Additional notes <span className="text-xs font-normal">(optional)</span>
        </label>
        <textarea
          id="pkg-notes"
          data-testid="wizard-notes"
          rows={4}
          placeholder="Any other details customers should know — itinerary, what to bring, accessibility info, etc."
          value={notes}
          onChange={(e) => onChange({ notes: e.target.value || undefined })}
          className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--textMuted)] focus:border-[var(--yellow)] focus:outline-none resize-none"
        />
        <p className="mt-1 text-xs text-[var(--textMuted)]">{notes.length}/2000</p>
      </div>
    </div>
  );
}

export function validateStep7(data: Partial<Package>): string | null {
  if (data.notes && data.notes.length > 2000) return 'Notes must be 2000 characters or fewer.';
  if (data.imageUrl && !/^https?:\/\/.+/.test(data.imageUrl)) return 'Image URL must start with http:// or https://';
  return null;
}
