import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';
import type { Package } from '@/lib/types';
import { z } from 'zod';

// ─── Zod schema ──────────────────────────────────────────────────────────────

const inclusionsSchema = z.object({
  visa: z.boolean(),
  flights: z.boolean(),
  transfers: z.boolean(),
  meals: z.boolean(),
});

const roomOccupancySchema = z.object({
  single: z.boolean(),
  double: z.boolean(),
  triple: z.boolean(),
  quad: z.boolean(),
});

const packageSchema = z.object({
  // Step 1 — required
  title: z.string().min(5, 'Title must be at least 5 characters').max(120, 'Title must be 120 characters or fewer'),
  pilgrimageType: z.enum(['umrah', 'hajj']),
  // Step 1 — optional
  seasonLabel: z.string().max(80).optional(),
  dateWindow: z.object({
    start: z.string().default(''),
    end: z.string().default(''),
  }).optional(),
  // Step 2 — required
  pricePerPerson: z.number().positive('Price must be greater than 0'),
  priceType: z.enum(['exact', 'from', 'fixed']),
  currency: z.literal('GBP').default('GBP'),
  // Step 2 — optional
  depositAmount: z.number().nonnegative().optional(),
  paymentPlanAvailable: z.boolean().optional(),
  // Step 3
  nightsMakkah: z.number().int().min(1, 'Makkah nights must be at least 1'),
  nightsMadinah: z.number().int().min(1, 'Madinah nights must be at least 1'),
  totalNights: z.number().int().min(2),
  hotelMakkahName: z.string().optional(),
  hotelMakkahStars: z.union([z.literal(3), z.literal(4), z.literal(5)]).optional(),
  distanceBandMakkah: z.enum(['near', 'medium', 'far', 'unknown']).default('medium'),
  distanceToHaramMakkahMetres: z.number().int().nonnegative().optional(),
  hotelMadinahName: z.string().optional(),
  hotelMadinahStars: z.union([z.literal(3), z.literal(4), z.literal(5)]).optional(),
  distanceBandMadinah: z.enum(['near', 'medium', 'far', 'unknown']).default('medium'),
  distanceToHaramMadinahMetres: z.number().int().nonnegative().optional(),
  // Step 4
  airline: z.string().optional(),
  departureAirport: z.string().optional(),
  flightType: z.enum(['direct', 'one-stop', 'multi-stop']).optional(),
  // Step 5
  inclusions: inclusionsSchema.default({ visa: false, flights: false, transfers: false, meals: false }),
  roomOccupancyOptions: roomOccupancySchema.default({ single: false, double: true, triple: true, quad: true }),
  // Step 6
  cancellationPolicy: z.string().max(1000).optional(),
  groupType: z.enum(['private', 'small-group', 'large-group']).optional(),
  // Step 7
  highlights: z.array(z.string().max(200)).max(5).optional(),
  notes: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  // Step 8 — publish status
  status: z.enum(['draft', 'published']).default('draft'),
});

// ─── POST — create package ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'operator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = packageSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || 'Invalid input';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const data = parsed.data;

    // Extra publish guard: cancellation policy required when publishing
    if (data.status === 'published' && (!data.cancellationPolicy || data.cancellationPolicy.length < 10)) {
      return NextResponse.json({ error: 'Cancellation policy required to publish (min 10 characters)' }, { status: 400 });
    }

    const ctx = { userId: user.id, role: user.role };

    // Strip empty imageUrl
    const pkg: Partial<Package> = { ...data as unknown as Partial<Package>, imageUrl: data.imageUrl || undefined };

    const created = await Repository.createPackage(ctx, pkg);

    return NextResponse.json({ package: created }, { status: 201 });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}

// ─── GET — list operator packages ─────────────────────────────────────────────

export async function GET(_request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'operator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const packages = await Repository.getPackagesByOperator(user.id);
    return NextResponse.json({ packages });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}

// ─── DELETE — remove operator package ─────────────────────────────────────────

export async function DELETE(_request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'operator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(_request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
    }

    const ctx = { userId: user.id, role: user.role };
    await Repository.deletePackage(ctx, id);

    return NextResponse.json({ success: true });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}

// ─── PATCH — update package ───────────────────────────────────────────────────

const updateSchema = packageSchema.partial().extend({
  id: z.string().min(1, 'Package ID required'),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'operator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || 'Invalid input';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { id, ...updates } = parsed.data;

    // Extra publish guard
    if (updates.status === 'published' && (!updates.cancellationPolicy || updates.cancellationPolicy.length < 10)) {
      return NextResponse.json({ error: 'Cancellation policy required to publish (min 10 characters)' }, { status: 400 });
    }

    const ctx = { userId: user.id, role: user.role };

    const pkg: Partial<Package> = { ...updates as unknown as Partial<Package>, imageUrl: updates.imageUrl || undefined };

    const updated = await Repository.updatePackage(ctx, id, pkg);

    return NextResponse.json({ package: updated });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
