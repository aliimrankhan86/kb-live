import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';
import type { Package } from '@/lib/types';
import { packageSchema, updatePackageSchema } from '@/lib/operator/package-schema';

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

    const pkg: Partial<Package> = { ...data as unknown as Partial<Package> };

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

const updateSchema = updatePackageSchema;

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

    const pkg: Partial<Package> = { ...updates as unknown as Partial<Package> };

    const updated = await Repository.updatePackage(ctx, id, pkg);

    return NextResponse.json({ package: updated });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
