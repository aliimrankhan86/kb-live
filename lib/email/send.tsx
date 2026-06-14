import * as React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import type { Package, QuoteRequest } from '@/lib/types';
import EnquiryConfirmation from '@/emails/EnquiryConfirmation';
import OperatorEnquiryAlert from '@/emails/OperatorEnquiryAlert';
import BookingIntentConfirmation from '@/emails/BookingIntentConfirmation';
import PaymentEvidenceNotification from '@/emails/PaymentEvidenceNotification';
import OperatorNudge from '@/emails/OperatorNudge';
import OutcomeFollowup from '@/emails/OutcomeFollowup';

const FROM = 'PilgrimCompare <notifications@send.pilgrimcompare.co.uk>';
const SUPPORT_REPLY = 'support@pilgrimcompare.co.uk';

function resendClient(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  return new Resend(key);
}

export type SimilarPackage = Pick<Package, 'title' | 'slug' | 'pricePerPerson' | 'currency' | 'totalNights'>;

/**
 * Returns up to 3 published packages that are similar to the given quote request.
 * Matches on departure airport (loose), nights (±30%), and budget ceiling.
 * Excludes the source package the customer already enquired about.
 */
export function findSimilarPackages(
  published: Package[],
  req: QuoteRequest,
): SimilarPackage[] {
  const nightsMin = req.totalNights * 0.7;
  const nightsMax = req.totalNights * 1.3;
  const budgetCeil = req.budgetRange ? req.budgetRange.max * 1.1 : Infinity;

  return published
    .filter((pkg) => {
      if (pkg.id === req.sourcePackageId) return false;
      const nightsOk = pkg.totalNights >= nightsMin && pkg.totalNights <= nightsMax;
      const airportOk =
        !req.departureAirport ||
        !pkg.departureAirport ||
        pkg.departureAirport === req.departureAirport;
      const budgetOk = pkg.pricePerPerson <= budgetCeil;
      return nightsOk && airportOk && budgetOk;
    })
    .slice(0, 3)
    .map((pkg) => ({
      title: pkg.title,
      slug: pkg.slug,
      pricePerPerson: pkg.pricePerPerson,
      currency: pkg.currency,
      totalNights: pkg.totalNights,
    }));
}

/** Format a UUID-based quote request ID as a short human-readable reference. */
export function quoteRefCode(id: string): string {
  return `QR-${id.slice(0, 8).toUpperCase()}`;
}

export async function sendEnquiryConfirmation(params: {
  customerEmail: string;
  customerName: string;
  packageName: string;
  operatorName: string;
  refCode: string;
  similarPackages: SimilarPackage[];
}): Promise<void> {
  try {
    const html = await render(
      <EnquiryConfirmation
        customerName={params.customerName}
        packageName={params.packageName}
        operatorName={params.operatorName}
        refCode={params.refCode}
        similarPackages={params.similarPackages}
      />
    );
    const { error } = await resendClient().emails.send({
      from: FROM,
      to: params.customerEmail,
      replyTo: SUPPORT_REPLY,
      subject: `Your Umrah enquiry is on its way — reference ${params.refCode}`,
      html,
    });
    if (error) console.error('[email] sendEnquiryConfirmation error:', error);
  } catch (err) {
    console.error('[email] sendEnquiryConfirmation failed:', err);
  }
}

export async function sendOperatorEnquiryAlert(params: {
  operatorEmail: string;
  operatorName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | undefined;
  packageName: string;
  travelDates: string;
  groupSize: string;
  message: string;
  refCode: string;
}): Promise<void> {
  try {
    const html = await render(
      <OperatorEnquiryAlert
        operatorName={params.operatorName}
        customerName={params.customerName}
        customerEmail={params.customerEmail}
        customerPhone={params.customerPhone}
        packageName={params.packageName}
        travelDates={params.travelDates}
        groupSize={params.groupSize}
        message={params.message}
        refCode={params.refCode}
      />
    );
    const { error } = await resendClient().emails.send({
      from: FROM,
      to: params.operatorEmail,
      replyTo: params.customerEmail,
      subject: `New enquiry from PilgrimCompare — ${params.customerName}, ${params.packageName}`,
      html,
    });
    if (error) console.error('[email] sendOperatorEnquiryAlert error:', error);
  } catch (err) {
    console.error('[email] sendOperatorEnquiryAlert failed:', err);
  }
}

export async function sendBookingIntentConfirmation(params: {
  customerEmail: string;
  customerName: string;
  operatorName: string;
  packageName: string | null;
  refCode: string;
}): Promise<void> {
  try {
    const html = await render(
      <BookingIntentConfirmation
        customerName={params.customerName}
        operatorName={params.operatorName}
        packageName={params.packageName}
        refCode={params.refCode}
      />
    );
    const { error } = await resendClient().emails.send({
      from: FROM,
      to: params.customerEmail,
      replyTo: SUPPORT_REPLY,
      subject: `Booking intent created — reference ${params.refCode}`,
      html,
    });
    if (error) console.error('[email] sendBookingIntentConfirmation error:', error);
  } catch (err) {
    console.error('[email] sendBookingIntentConfirmation failed:', err);
  }
}

export async function sendOperatorNudge(params: {
  operatorEmail: string;
  operatorName: string;
  customerName: string;
  customerEmail: string;
  packageName: string;
  hoursOld: number;
  refCode: string;
}): Promise<void> {
  try {
    const html = await render(
      <OperatorNudge
        operatorName={params.operatorName}
        customerName={params.customerName}
        customerEmail={params.customerEmail}
        packageName={params.packageName}
        hoursOld={params.hoursOld}
        refCode={params.refCode}
      />
    );
    const { error } = await resendClient().emails.send({
      from: FROM,
      to: params.operatorEmail,
      replyTo: params.customerEmail,
      subject: `Reminder — you have an unanswered PilgrimCompare enquiry`,
      html,
    });
    if (error) console.error('[email] sendOperatorNudge error:', error);
  } catch (err) {
    console.error('[email] sendOperatorNudge failed:', err);
  }
}

export async function sendOutcomeFollowup(params: {
  customerEmail: string;
  customerName: string;
  operatorName: string;
  packageName: string;
  refCode: string;
  intentId: string;
}): Promise<void> {
  try {
    const html = await render(
      <OutcomeFollowup
        customerName={params.customerName}
        operatorName={params.operatorName}
        packageName={params.packageName}
        refCode={params.refCode}
        intentId={params.intentId}
      />
    );
    const { error } = await resendClient().emails.send({
      from: FROM,
      to: params.customerEmail,
      replyTo: SUPPORT_REPLY,
      subject: `Did your Umrah booking with ${params.operatorName} go ahead?`,
      html,
    });
    if (error) console.error('[email] sendOutcomeFollowup error:', error);
  } catch (err) {
    console.error('[email] sendOutcomeFollowup failed:', err);
  }
}

export async function sendPaymentEvidenceNotification(params: {
  operatorEmail: string;
  operatorName: string;
  customerName: string;
  packageName: string | null;
  refCode: string;
}): Promise<void> {
  try {
    const html = await render(
      <PaymentEvidenceNotification
        operatorName={params.operatorName}
        customerName={params.customerName}
        packageName={params.packageName}
        refCode={params.refCode}
      />
    );
    const { error } = await resendClient().emails.send({
      from: FROM,
      to: params.operatorEmail,
      replyTo: SUPPORT_REPLY,
      subject: `Payment evidence received — ${params.customerName}, ${params.packageName ?? 'package'}`,
      html,
    });
    if (error) console.error('[email] sendPaymentEvidenceNotification error:', error);
  } catch (err) {
    console.error('[email] sendPaymentEvidenceNotification failed:', err);
  }
}
