import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { mapErrorToResponse } from '@/lib/errors';
import { BUCKETS, uploadFile, getPublicUrl } from '@/lib/api/storage';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// ─── POST — upload a single package image, returns its public URL ─────────────

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'operator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Image must be JPEG, PNG, or WebP' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be 5MB or smaller' }, { status: 400 });
    }

    // contextId groups images per package; new packages have no id yet.
    const rawContext = form.get('packageId');
    const contextId = typeof rawContext === 'string' && rawContext.trim() ? rawContext.trim() : 'new';
    const filename = `${crypto.randomUUID()}.${EXTENSION[file.type]}`;

    const { path } = await uploadFile(BUCKETS.packageImages, user.id, contextId, file, filename);
    const url = await getPublicUrl(BUCKETS.packageImages, path);

    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
