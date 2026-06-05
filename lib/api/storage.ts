import { createClient } from '@/lib/supabase/server';

const BUCKETS = {
  evidence: 'evidence-files',
  exports: 'operator-exports',
} as const;

type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

/**
 * Build a storage path: {userId}/{bookingIntentId}/{filename}
 */
function buildPath(userId: string, contextId: string, filename: string): string {
  return `${userId}/${contextId}/${filename}`;
}

/**
 * Generate a signed upload URL (time-limited) for authenticated users.
 */
export async function createSignedUploadUrl(
  bucket: BucketName,
  userId: string,
  contextId: string,
  filename: string
) {
  const supabase = await createClient();
  const path = buildPath(userId, contextId, filename);
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path, { upsert: true });
  if (error) throw new Error(error.message);
  return { path, signedUrl: data.signedUrl, token: data.token };
}

/**
 * Generate a signed download URL (time-limited) for authenticated users.
 */
export async function createSignedDownloadUrl(
  bucket: BucketName,
  userId: string,
  contextId: string,
  filename: string,
  expirySeconds = 300
) {
  const supabase = await createClient();
  const path = buildPath(userId, contextId, filename);
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expirySeconds);
  if (error) throw new Error(error.message);
  return { path, signedUrl: data.signedUrl };
}

/**
 * Upload a file directly (server-side). Uses authenticated client.
 */
export async function uploadFile(
  bucket: BucketName,
  userId: string,
  contextId: string,
  file: File | Blob,
  filename: string
) {
  const supabase = await createClient();
  const path = buildPath(userId, contextId, filename);
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  return { ...data, path };
}

/**
 * Delete a file from storage.
 */
export async function deleteFile(
  bucket: BucketName,
  userId: string,
  contextId: string,
  filename: string
) {
  const supabase = await createClient();
  const path = buildPath(userId, contextId, filename);
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);
}

/**
 * List files for a given user + context.
 */
export async function listFiles(bucket: BucketName, userId: string, contextId: string) {
  const supabase = await createClient();
  const prefix = `${userId}/${contextId}/`;
  const { data, error } = await supabase.storage.from(bucket).list(prefix);
  if (error) throw new Error(error.message);
  return data || [];
}

export { BUCKETS };