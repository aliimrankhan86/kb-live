import { NextRequest, NextResponse } from 'next/server';
import { enquirySchema } from '@/lib/validation';
import { Repository } from '@/lib/api/repository';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';
import { mapErrorToResponse } from '@/lib/errors';
import { sendEnquiryConfirmation, sendOperatorEnquiryAlert } from '@/lib/email/send';
import type { Enquiry, OperatorProfile, Package } from '@/lib/types';

/**
 * Canonical pilgrim enquiry (Task 2): one package, one enquiry, one operator.
 * Anonymous — no auth required. Persists the enquiry with a unique reference
 * code, then fires confirmation + operator-alert emails via the EXISTING Resend
 * setup (fire-and-forget; email failure never fails the enquiry).
 */
export async function POST(request: NextRequest) {
  // Throttle by IP. Scoped separately from auth / quote / interest buckets.
  const rateLimit = await checkRateLimit(getRateLimitIdentifier(request, 'enquiry'));
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    );
  }

  try {
    const body = await request.json();
    const parsed = enquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { packageId, name, email, phone, travelMonth, message } = parsed.data;

    // Resolve the package + operator server-side so the lead carries honest,
    // package-sourced names (never client-supplied). Reject unknown/unpublished.
    const pkg = await Repository.getPackageById(packageId);
    if (!pkg || pkg.status !== 'published') {
      return NextResponse.json({ error: 'This package is no longer available.' }, { status: 404 });
    }
    const operator = await Repository.getOperatorById(pkg.operatorId);

    const enquiry = await Repository.createEnquiry({
      packageId: pkg.id,
      operatorId: pkg.operatorId,
      packageTitle: pkg.title,
      operatorName: operator?.tradingName ?? operator?.companyName,
      name,
      email: email || undefined,
      phone: phone || undefined,
      travelMonth: travelMonth || undefined,
      message: message || undefined,
    });

    // Fire-and-forget: emails must not fail the API response.
    void sendEnquiryEmails(enquiry, pkg, operator);

    return NextResponse.json({ referenceCode: enquiry.referenceCode }, { status: 201 });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}

async function sendEnquiryEmails(
  enquiry: Enquiry,
  pkg: Package,
  operator: OperatorProfile | undefined
): Promise<void> {
  try {
    const operatorName = enquiry.operatorName ?? 'the operator';
    const packageName = enquiry.packageTitle ?? pkg.title;

    // Pilgrim confirmation — only when an email was provided.
    if (enquiry.email) {
      await sendEnquiryConfirmation({
        customerEmail: enquiry.email,
        customerName: enquiry.name || 'Pilgrim',
        packageName,
        operatorName,
        refCode: enquiry.referenceCode,
        similarPackages: [],
      });
    }

    // Operator lead alert — only when the operator has a contact email.
    if (operator?.contactEmail) {
      await sendOperatorEnquiryAlert({
        operatorEmail: operator.contactEmail,
        operatorName,
        customerName: enquiry.name || enquiry.email || enquiry.phone || 'A pilgrim',
        customerEmail: enquiry.email ?? '',
        customerPhone: enquiry.phone,
        packageName,
        travelDates: enquiry.travelMonth ?? 'Not provided',
        groupSize: 'Not provided',
        message: enquiry.message ?? '',
        refCode: enquiry.referenceCode,
      });
    }
  } catch (err) {
    console.error('[email] sendEnquiryEmails failed:', err);
  }
}
