import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';

// Profile edits must persist server-side: the form used to call the Repository
// in the browser, which only reaches MockDB, so saves were silently lost.
const optionalText = (max: number) => z.string().trim().max(max).optional();

const profileSchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  tradingName: optionalText(160),
  companyRegistrationNumber: optionalText(20),
  atolNumber: optionalText(20),
  abtaMemberNumber: optionalText(20),
  contactEmail: z.string().trim().email(),
  contactPhone: optionalText(40),
  officeAddress: z
    .object({
      line1: z.string().trim().max(200),
      line2: optionalText(200),
      city: z.string().trim().max(100),
      postcode: z.string().trim().max(20),
      country: z.string().trim().max(60),
    })
    .optional(),
  websiteUrl: z.string().trim().url().max(300).optional(),
  yearsInBusiness: z.number().int().min(0).max(200).optional(),
  servingRegions: z.array(z.string().max(60)).max(30).optional(),
  pilgrimageTypesOffered: z.array(z.enum(['umrah', 'hajj'])).max(2).optional(),
}).strict();

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'operator') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const parsed = profileSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }
    const operator = await Repository.updateOperator({ userId: user.id, role: user.role }, user.id, parsed.data);
    return NextResponse.json({ operator });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
