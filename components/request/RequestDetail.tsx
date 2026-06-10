'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { BookingIntent, BookingPaymentEvidenceFile, QuoteRequest, Offer, OperatorProfile } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  OverlayContent,
  OverlayHeader,
  OverlayTitle,
} from '@/components/ui/Overlay';
import { Button, Checkbox, Input } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { ComparisonTable } from './ComparisonTable';
import { PaymentInstructions } from './PaymentInstructions';
import { ComplaintForm } from './ComplaintForm';
import { handleOfferSelection } from '@/lib/comparison';
import { createClient } from '@/lib/supabase/client';
import { formatMoney } from '@/lib/i18n/format';
import { CURRENCY_CHANGE_EVENT, getRegionSettings } from '@/lib/i18n/region';

const EVIDENCE_BUCKET = 'payment-evidence';
const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED_EVIDENCE_MIME = ['image/jpeg', 'image/png', 'application/pdf'];
const PAYMENT_EVIDENCE_ACCEPT = '.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf';
const PAY_OPERATOR_DIRECT_DISCLOSURE =
  'You pay the operator directly. KaabaTrip does not collect, hold, or transfer customer funds. The operator is the contracting party and is responsible for package fulfilment, payment records, and any payment outcome.';
const SKIP_PROOF_ACKNOWLEDGEMENT =
  'KaabaTrip does not have access to the operator’s payment records… ability to help evidence payment may be limited… This does not remove legal rights…';

const displayValue = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : 'Not provided';
};

const isAcceptedEvidenceFile = (file: File) => ACCEPTED_EVIDENCE_MIME.includes(file.type);

const getEvidenceFileKind = (file: File): BookingPaymentEvidenceFile['kind'] =>
  file.type === 'application/pdf' ? 'pdf' : 'image';

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Strip path separators and unsafe chars so the object key stays a single segment.
const sanitizeFileName = (name: string): string =>
  name.replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^_+|_+$/g, '') || 'file';

export function BookableButton({
  existingIntent,
  onProceed,
  isBookable,
}: {
  existingIntent: boolean;
  onProceed: () => void;
  isBookable: boolean;
}) {
  if (existingIntent) {
    return (
      <Button type="button" size="sm" disabled className="flex-1" data-testid="book-now-btn">
        Intent recorded
      </Button>
    );
  }

  if (!isBookable) {
    return (
      <Button
        type="button"
        size="sm"
        disabled
        aria-disabled="true"
        className="flex-1"
        data-testid="book-now-btn"
        title="Verification in progress"
      >
        Verification in progress
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      onClick={onProceed}
      className="flex-1"
      data-testid="book-now-btn"
    >
      Proceed direct
    </Button>
  );
}

export function RequestDetail({ id }: { id: string }) {
  const router = useRouter();
  const [regionSettings, setRegionSettings] = useState(() => getRegionSettings());
  const [request, setRequest] = useState<QuoteRequest | undefined>(undefined);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [operators, setOperators] = useState<OperatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [bookingIntents, setBookingIntents] = useState<BookingIntent[]>([]);
  const [activeOfferForBooking, setActiveOfferForBooking] = useState<Offer | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<BookingPaymentEvidenceFile[]>([]);
  const [evidenceRawFiles, setEvidenceRawFiles] = useState<File[]>([]);
  const [evidenceInputKey, setEvidenceInputKey] = useState(0);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [payerName, setPayerName] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [skipProof, setSkipProof] = useState(false);
  const [skipProofAcknowledged, setSkipProofAcknowledged] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const bookingErrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const reqRes = await fetch(`/api/quote-requests/${id}`);
        if (!reqRes.ok) return;
        const { request: req } = await reqRes.json() as { request: QuoteRequest };
        setRequest(req);

        const [offsRes, opsRes, intentsRes] = await Promise.all([
          fetch(`/api/quote-requests/${id}/offers`),
          fetch('/api/operators'),
          fetch('/api/booking-intents'),
        ]);
        if (offsRes.ok) {
          const { offers } = await offsRes.json() as { offers: Offer[] };
          setOffers(offers);
        }
        if (opsRes.ok) {
          const { operators } = await opsRes.json() as { operators: OperatorProfile[] };
          setOperators(operators);
        }
        if (intentsRes.ok) {
          const { bookingIntents } = await intentsRes.json() as { bookingIntents: BookingIntent[] };
          setBookingIntents(bookingIntents);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const updateSettings = () => setRegionSettings(getRegionSettings());
    window.addEventListener(CURRENCY_CHANGE_EVENT, updateSettings);
    return () => window.removeEventListener(CURRENCY_CHANGE_EVENT, updateSettings);
  }, []);

  useEffect(() => {
    if (bookingError) bookingErrorRef.current?.focus();
  }, [bookingError]);

  const resetBookingForm = () => {
    setEvidenceFiles([]);
    setEvidenceRawFiles([]);
    setEvidenceInputKey((current) => current + 1);
    setPayerName('');
    setPaymentReference('');
    setEvidenceNotes('');
    setSkipProof(false);
    setSkipProofAcknowledged(false);
    setBookingError(null);
  };

  const handleEvidenceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    const clearSelection = (message: string) => {
      setEvidenceFiles([]);
      setEvidenceRawFiles([]);
      setEvidenceInputKey((current) => current + 1);
      setBookingError(message);
    };

    const invalidFile = files.find((file) => !isAcceptedEvidenceFile(file));
    if (invalidFile) {
      clearSelection('Payment evidence must be a JPG, PNG, or PDF file.');
      return;
    }

    const oversizeFile = files.find((file) => file.size > MAX_EVIDENCE_BYTES);
    if (oversizeFile) {
      clearSelection(`"${oversizeFile.name}" is ${formatBytes(oversizeFile.size)}. Each file must be 10MB or smaller.`);
      return;
    }

    const uploadedAt = new Date().toISOString();
    setEvidenceRawFiles(files);
    setEvidenceFiles(
      files.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        kind: getEvidenceFileKind(file),
        lastModified: file.lastModified,
        uploadedAt,
      }))
    );

    if (files.length > 0) {
      setSkipProof(false);
      setSkipProofAcknowledged(false);
      setBookingError(null);
    }
  };

  // Uploads the selected files to the private `payment-evidence` bucket and returns
  // evidence metadata stamped with each object's storage path.
  const uploadEvidenceFiles = async (bookingIntentId: string): Promise<BookingPaymentEvidenceFile[]> => {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('File storage is unavailable. Please try again later or choose Skip proof.');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('You must be signed in to upload payment evidence.');
    }

    setUploadingEvidence(true);
    try {
      const uploadedAt = new Date().toISOString();
      const uploaded: BookingPaymentEvidenceFile[] = [];

      for (const file of evidenceRawFiles) {
        const objectName = `${Date.now()}-${sanitizeFileName(file.name)}`;
        const path = `${bookingIntentId}/${user.id}/${objectName}`;
        const { error: uploadError } = await supabase.storage
          .from(EVIDENCE_BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });

        if (uploadError) {
          throw new Error(`Failed to upload "${file.name}": ${uploadError.message}`);
        }

        uploaded.push({
          id: crypto.randomUUID(),
          name: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          kind: getEvidenceFileKind(file),
          lastModified: file.lastModified,
          uploadedAt,
          storagePath: path,
        });
      }

      return uploaded;
    } finally {
      setUploadingEvidence(false);
    }
  };

  const handleBookingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeOfferForBooking) return;

    const hasEvidence = evidenceFiles.length > 0;

    if (!hasEvidence && !skipProof) {
      setBookingError('Upload payment evidence or choose Skip proof before continuing.');
      return;
    }

    if (skipProof && !skipProofAcknowledged) {
      setBookingError('Confirm the skip-proof acknowledgement before continuing.');
      return;
    }

    try {
      const submittedAt = new Date().toISOString();
      const bookingIntentId = crypto.randomUUID();

      let evidenceFilePayload = evidenceFiles;
      if (hasEvidence) {
        evidenceFilePayload = await uploadEvidenceFiles(bookingIntentId);
      }

      const bookingPayload: Partial<BookingIntent> = {
        id: bookingIntentId,
        offerId: activeOfferForBooking.id,
        operatorId: activeOfferForBooking.operatorId,
        notes: evidenceNotes,
        paymentEvidence: hasEvidence
          ? {
              files: evidenceFilePayload,
              payerName,
              paymentReference,
              notes: evidenceNotes,
              submittedAt,
              storageStatus: 'bytes-stored' as const,
            }
          : undefined,
        skipProofAcknowledged: !hasEvidence && skipProofAcknowledged,
      };

      let newIntent: BookingIntent;

      const response = await fetch('/api/booking-intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      });

      if (response.ok) {
        const data = await response.json() as { bookingIntent: BookingIntent };
        newIntent = data.bookingIntent;
      } else {
        const errData = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(errData.error ?? 'Failed to create booking intent.');
      }
      setBookingIntents((current) => [newIntent, ...current.filter((intent) => intent.id !== newIntent.id)]);
      if (!newIntent.referenceCode) throw new Error('Reference code was not issued.');
      setActiveOfferForBooking(null);
      resetBookingForm();
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Failed to create booking intent.');
    }
  };

  if (loading) return <div className="p-8 text-center text-[#FFFFFF]">Loading...</div>;
  if (!request) return <div className="p-8 text-center text-[#FFFFFF]">Request not found.</div>;

  const getOperator = (opId: string) => operators.find((o) => o.id === opId);
  const activeBookingOperatorName = activeOfferForBooking
    ? displayValue(getOperator(activeOfferForBooking.operatorId)?.companyName)
    : 'Not provided';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid="request-back-button"
          onClick={() => router.back()}
          className="px-0 text-[var(--textMuted)] hover:bg-transparent hover:text-[var(--text)]"
        >
          Back to previous page
        </Button>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#FFFFFF]">Quote Request #{request.id.slice(0, 8)}</h1>
        <span className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
          request.status === 'open' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
        }`}>
          {request.status}
        </span>
      </div>


      {/* Request Summary */}
      <div className="mb-8 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-6">
        <div className="grid grid-cols-2 gap-4 text-sm text-[#FFFFFF] sm:grid-cols-4">
          <div>
            <p className="text-[rgba(255,255,255,0.4)]">Type</p>
            <p className="capitalize">{request.type}</p>
          </div>
          <div>
            <p className="text-[rgba(255,255,255,0.4)]">Season</p>
            <p className="capitalize">{request.season}</p>
          </div>
          <div>
            <p className="text-[rgba(255,255,255,0.4)]">Departure</p>
            <p>{displayValue(request.departureCity)}</p>
          </div>
          <div>
            <p className="text-[rgba(255,255,255,0.4)]">Budget</p>
            <p>
              {request.budgetRange
                ? `${formatMoney(request.budgetRange.min, request.budgetRange.currency, regionSettings.locale)} - ${formatMoney(request.budgetRange.max, request.budgetRange.currency, regionSettings.locale)}`
                : 'Not provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Offers List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#FFFFFF]">Offers Received ({offers.length})</h2>
          {selectedOffers.length > 1 && (
            <Button
              type="button"
              size="sm"
              onClick={() => setShowComparison(true)}
            >
              Compare ({selectedOffers.length})
            </Button>
          )}
        </div>
        
        {offers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[rgba(255,255,255,0.1)] p-8 text-center text-[rgba(255,255,255,0.4)]">
            Waiting for operators to respond...
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => {
              const op = getOperator(offer.operatorId);
              const isSelected = selectedOffers.includes(offer.id);
              const existingIntent = bookingIntents.find((intent) => intent.offerId === offer.id);
              const operatorName = displayValue(op?.companyName);
              const distanceToHaram = displayValue(offer.distanceToHaram);
              
              return (
                <div 
                  key={offer.id} 
                  data-testid="offer-card"
                  className={`rounded-lg border bg-[#111111] p-6 shadow-sm transition-colors ${
                    isSelected ? 'border-[#FFD31D] bg-[rgba(255,211,29,0.02)]' : 'border-[rgba(255,255,255,0.1)] hover:border-[#FFD31D]'
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        id={`compare-offer-${offer.id}`}
                        type="checkbox"
                        data-testid="offer-compare-checkbox"
                        checked={isSelected}
                        onChange={() => {
                          try {
                            const newSelected = handleOfferSelection(selectedOffers, offer.id);
                            setSelectedOffers(newSelected);
                          } catch (err) {
                            alert((err as Error).message);
                          }
                        }}
                        className="h-4 w-4 rounded border-[rgba(255,255,255,0.3)] bg-transparent text-[#FFD31D] focus:ring-[#FFD31D]"
                        aria-label={`Compare offer from ${operatorName}`}
                      />
                      <span className="font-medium text-[#FFFFFF]">{operatorName}</span>
                    </div>
                    {op?.verificationStatus === 'verified' && (
                      <span className="text-xs text-[#FFD31D]">Verified</span>
                    )}
                  </div>
                  <div className="mb-4 text-2xl font-bold text-[#FFD31D]">
                    {formatMoney(offer.pricePerPerson, offer.currency, regionSettings.locale)}
                    <span className="text-sm font-normal text-[rgba(255,255,255,0.64)]">/person</span>
                  </div>
                  <div className="space-y-2 text-sm text-[rgba(255,255,255,0.64)]">
                    <p>{offer.totalNights} Nights Total</p>
                    <p>{offer.hotelStars} Star Hotels</p>
                    <p>{distanceToHaram === 'Not provided' ? distanceToHaram : `${distanceToHaram} to Haram`}</p>
                  </div>
                  {existingIntent ? (
                    <div className="mt-5 space-y-4">
                      <div className="rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.04)] p-3 text-sm">
                        <p className="font-medium text-[var(--text)]">Booking intent recorded</p>
                        <p className="mt-1 text-[var(--textMuted)]">
                          Reference:{' '}
                          <span data-testid="booking-intent-reference-code" className="font-mono text-[var(--yellow)]">
                            {displayValue(existingIntent.referenceCode)}
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-[var(--textMuted)]">
                          Evidence is visible only to you, the involved operator, and KaabaTrip admin.
                        </p>
                      </div>
                      <PaymentInstructions bookingIntent={existingIntent} />
                      <ComplaintForm bookingIntent={existingIntent} />
                    </div>
                  ) : null}
                  <div className="mt-6 flex gap-2">
                    <Button type="button" variant="secondary" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <BookableButton
                      existingIntent={Boolean(existingIntent)}
                      onProceed={() => {
                        resetBookingForm();
                        setActiveOfferForBooking(offer);
                      }}
                      isBookable={
                        getOperator(offer.operatorId)?.eligibilityFlags?.canReceiveBookings === true &&
                        getOperator(offer.operatorId)?.eligibilityFlags?.bankDetailsActive === true
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <OverlayContent className="max-w-4xl overflow-x-auto">
          <OverlayHeader>
            <OverlayTitle>Compare Offers</OverlayTitle>
          </OverlayHeader>
          <div className="mt-4">
            <ComparisonTable offers={offers.filter(o => selectedOffers.includes(o.id))} />
          </div>
        </OverlayContent>
      </Dialog>

      <Dialog
        open={Boolean(activeOfferForBooking)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveOfferForBooking(null);
            resetBookingForm();
          }
        }}
      >
        <OverlayContent className="max-w-2xl">
          <OverlayHeader>
            <OverlayTitle>Proceed direct with operator</OverlayTitle>
          </OverlayHeader>

          <form className="mt-5 space-y-5" onSubmit={handleBookingSubmit}>
            <section
              aria-labelledby="pay-operator-direct-heading"
              className="rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,211,29,0.08)] p-4"
            >
              <h3 id="pay-operator-direct-heading" className="text-sm font-semibold text-[var(--text)]">
                Pay operator direct
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--textMuted)]">{PAY_OPERATOR_DIRECT_DISCLOSURE}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--textMuted)]">
                Selected operator: <span className="font-medium text-[var(--text)]">{activeBookingOperatorName}</span>
              </p>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Payer name (optional)"
                value={payerName}
                onChange={(event) => setPayerName(event.target.value)}
                autoComplete="name"
              />
              <Input
                label="Operator payment reference (optional)"
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="payment-evidence-upload" className="block text-sm font-medium text-[var(--text)]">
                Upload payment evidence
              </label>
              <input
                key={evidenceInputKey}
                id="payment-evidence-upload"
                type="file"
                accept={PAYMENT_EVIDENCE_ACCEPT}
                multiple
                data-testid="payment-evidence-upload"
                aria-describedby="payment-evidence-help"
                onChange={handleEvidenceChange}
                className="block min-h-11 w-full rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-3 py-2 text-sm text-[var(--text)] file:mr-4 file:rounded-md file:border-0 file:bg-[var(--yellow)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)]"
              />
              <p id="payment-evidence-help" className="text-xs text-[var(--textMuted)]">
                Accepted formats: JPG, PNG, or PDF. Maximum 10MB per file. Files are stored securely and visible only to you, the operator, and KaabaTrip admin.
              </p>
              {evidenceFiles.length > 0 ? (
                <ul className="space-y-1 text-xs text-[var(--textMuted)]" aria-label="Selected evidence files">
                  {evidenceFiles.map((file) => (
                    <li key={file.id} data-testid="payment-evidence-file">
                      {file.name} <span className="text-[var(--textMuted)]">({file.kind.toUpperCase()}, {formatBytes(file.sizeBytes)})</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <Textarea
              label="Payment note (optional)"
              value={evidenceNotes}
              onChange={(event) => setEvidenceNotes(event.target.value)}
              placeholder="Add optional context for the operator or admin."
            />

            <div className="space-y-3 rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.04)] p-4">
              <Checkbox
                id="skip-payment-proof"
                data-testid="payment-proof-skip-checkbox"
                label="Skip proof for now"
                helperText="Use this only if you cannot upload payment evidence at this step."
                checked={skipProof}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setSkipProof(checked);
                  setSkipProofAcknowledged(false);
                  if (checked) {
                    setEvidenceFiles([]);
                    setEvidenceInputKey((current) => current + 1);
                  }
                }}
              />
              {skipProof ? (
                <Checkbox
                  id="skip-payment-proof-acknowledgement"
                  data-testid="payment-proof-acknowledgement-checkbox"
                  label="I understand the limitation"
                  helperText={SKIP_PROOF_ACKNOWLEDGEMENT}
                  checked={skipProofAcknowledged}
                  onChange={(event) => setSkipProofAcknowledged(event.target.checked)}
                />
              ) : null}
            </div>

            {bookingError ? (
              <div
                ref={bookingErrorRef}
                role="alert"
                tabIndex={-1}
                className="rounded-md border border-[var(--danger)] bg-[rgba(239,68,68,0.12)] p-3 text-sm text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--danger)]"
              >
                {bookingError}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setActiveOfferForBooking(null);
                  resetBookingForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" data-testid="booking-intent-submit" disabled={uploadingEvidence}>
                {uploadingEvidence ? 'Uploading evidence…' : 'Record booking intent'}
              </Button>
            </div>
          </form>
        </OverlayContent>
      </Dialog>

      {/* Temporary Link to Operator Dashboard for Demo */}
      <div className="mt-12 border-t border-[rgba(255,255,255,0.1)] pt-8 text-center">
        <p className="text-sm text-[rgba(255,255,255,0.4)]">Demo Navigation</p>
        <Link href="/operator/dashboard" className="mt-2 inline-block rounded text-[#FFD31D] underline hover:text-[#E5BD1A]">
          Go to Operator Dashboard (Simulate Response)
        </Link>
      </div>
    </div>
  );
}
