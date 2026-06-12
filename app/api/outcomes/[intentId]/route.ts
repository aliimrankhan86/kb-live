import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/api/db/prisma';
import type { BookingOutcomeType } from '@/lib/types';

const RESULT_TO_OUTCOME: Record<string, BookingOutcomeType> = {
  booked: 'travelled',
  not_booked: 'cancelled_customer',
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pilgrimcompare.co.uk';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ intentId: string }> },
) {
  const { intentId } = await params;
  const result = new URL(request.url).searchParams.get('result');

  const validResults = ['booked', 'not_booked', 'deciding'] as const;
  if (!result || !(validResults as readonly string[]).includes(result)) {
    return NextResponse.json({ error: 'Invalid result' }, { status: 400 });
  }

  // Verify the booking intent exists.
  const intent = await prisma.bookingIntent.findUnique({
    where: { id: intentId },
    select: { id: true, outcome: true },
  });

  if (!intent) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (result === 'deciding') {
    // No outcome to record — customer hasn't decided yet.
    return respondWithThanks('Thank you. We will check back with you later.');
  }

  const outcomeType = RESULT_TO_OUTCOME[result];

  // Idempotent: if an outcome already exists for this intent, just acknowledge.
  if (intent.outcome) {
    return respondWithThanks('Your response has already been recorded. Thank you.');
  }

  // BookingOutcome records must NEVER be deleted — billing evidence.
  await prisma.bookingOutcome.create({
    data: {
      bookingIntentId: intentId,
      outcome: outcomeType,
    },
  });

  const message =
    result === 'booked'
      ? 'Great news — your booking has been recorded. Thank you for using PilgrimCompare.'
      : 'Understood. Your response has been recorded. Thank you for letting us know.';

  return respondWithThanks(message);
}

function respondWithThanks(message: string): NextResponse {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>PilgrimCompare</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #fff; border-radius: 8px; padding: 40px; max-width: 480px; text-align: center; }
    h1 { font-size: 18px; color: #1a1a1a; margin: 0 0 12px; }
    p { font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 24px; }
    a { color: #1a73e8; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>PilgrimCompare</h1>
    <p>${message}</p>
    <a href="${BASE_URL}">Return to PilgrimCompare</a>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
