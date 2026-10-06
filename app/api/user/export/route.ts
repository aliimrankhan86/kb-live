import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';

export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const ctx = { userId, role: user.role };

    const [allRequests, allBookingIntents, allComplaints, emailData] = await Promise.all([
      Repository.getRequests(ctx),
      Repository.getBookingIntents(ctx),
      Repository.getComplaints(ctx),
      Repository.getOwnEmailData(user.email ?? ''),
    ]);

    const requests = allRequests.filter((r) => r.customerId === userId);
    const bookingIntents = allBookingIntents.filter((b) => b.customerId === userId);
    const complaints = allComplaints.filter((c) => c.customerId === userId);

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: {
        id: userId,
        email: user.email,
        name: user.name ?? null,
        role: user.role,
      },
      requests,
      bookingIntents: bookingIntents.map((b) => ({
        ...b,
        paymentEvidence: b.paymentEvidence
          ? {
              ...b.paymentEvidence,
              files: b.paymentEvidence.files.map(({ storagePath: _storagePath, ...f }) => f),
            }
          : undefined,
      })),
      enquiries: emailData.enquiries,
      marketingConsents: emailData.marketingConsents,
      interests: emailData.interests,
      complaints,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="my-data-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
