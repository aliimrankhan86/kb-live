'use client';

import { useRef, useState } from 'react';
import type { Package } from '@/lib/types';

interface Props {
  data: Partial<Package>;
  onChange: (updates: Partial<Package>) => void;
  error: string | null;
}

const MAX_HIGHLIGHTS = 5;
const MAX_IMAGES = 8;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function WizardStep7Marketing({ data, onChange, error }: Props) {
  const highlights = data.highlights ?? [''];
  const notes = data.notes ?? '';
  const images = data.images ?? [];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const remaining = MAX_IMAGES - images.length;
    const selected = Array.from(files).slice(0, remaining);
    if (selected.length === 0) {
      setUploadError(`You can upload up to ${MAX_IMAGES} images.`);
      return;
    }

    setIsUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of selected) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          throw new Error('Images must be JPEG, PNG, or WebP.');
        }
        if (file.size > MAX_IMAGE_BYTES) {
          throw new Error('Each image must be 5MB or smaller.');
        }

        const form = new FormData();
        form.append('file', file);
        if (data.id) form.append('packageId', data.id);

        const res = await fetch('/api/operator/packages/images', {
          method: 'POST',
          body: form,
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error((json as { error?: string }).error || 'Upload failed');
        }
        const json = (await res.json()) as { url: string };
        uploaded.push(json.url);
      }

      onChange({ images: [...images, ...uploaded] });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (url: string) => {
    onChange({ images: images.filter((img) => img !== url) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Marketing &amp; media</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">Add package highlights, additional notes, and cover images.</p>
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

      {/* Cover images */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wide">
            Cover images
            <span className="ml-1.5 text-xs font-normal text-[var(--textMuted)] normal-case tracking-normal">
              (up to {MAX_IMAGES}, optional)
            </span>
          </h3>
        </div>

        {images.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4" data-testid="wizard-image-grid">
            {images.map((url) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded border border-[rgba(255,255,255,0.1)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Package cover" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  aria-label="Remove image"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {uploadError && (
          <p role="alert" className="mb-2 text-xs text-red-400">{uploadError}</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          multiple
          data-testid="wizard-image-upload"
          disabled={isUploading || images.length >= MAX_IMAGES}
          onChange={(e) => handleFiles(e.target.files)}
          className="block w-full text-sm text-[var(--textMuted)] file:mr-3 file:rounded file:border-0 file:bg-[var(--yellow)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:opacity-90 disabled:opacity-50"
        />
        <p className="mt-1 text-xs text-[var(--textMuted)]">
          {isUploading
            ? 'Uploading…'
            : `JPEG, PNG, or WebP up to 5MB each. ${MAX_IMAGES - images.length} slot(s) left.`}
        </p>
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
  if (data.images && data.images.some((url) => !/^https?:\/\/.+/.test(url))) {
    return 'Image URLs must start with http:// or https://';
  }
  return null;
}
