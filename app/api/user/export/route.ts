import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { mapErrorToResponse } from '@/lib/errors';

export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const ctx = { userId, role: user.role };

    const [allRequests, allBookingIntents, allComplaints] = await Promise.all([
      Repository.getRequests(ctx),
      Repository.getBookingIntents(ctx),
      Repository.getComplaints(ctx),
    ]);

    const requests = allRequests.filter((r) => r.customerId === userId);
    const bookingIntents = allBookingIntents.filter((b) => b.customerId === userId);
    const complaints = allComplaints.filter((c) => c.customerId === userId);

    const supabase = createServiceRoleClient();
    const { data: interestRows } = await supabase
      .from('interests')
      .select('email, type, created_at')
      .eq('email', user.email?.toLowerCase() ?? '');
    const interests = interestRows ?? [];

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
      interests,
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
