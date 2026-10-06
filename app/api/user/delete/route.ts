import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { ACCOUNT_DELETE_MANUAL_MESSAGE, Repository } from '@/lib/api/repository';
import { ACCOUNT_DELETE_NOT_FINISHED } from '@/lib/account-delete';
import { AppError } from '@/lib/errors';

/**
 * Hajj "notify me" rows for this email (stored lower-case by /api/interest,
 * read the same way by /api/user/export). Deleting nothing is fine on a retry.
 */
async function deleteInterests(email: string | undefined): Promise<void> {
  const target = (email ?? '').trim().toLowerCase();
  if (!target) return;
  const { error } = await createServiceRoleClient().from('interests').delete().eq('email', target);
  if (error) throw new Error(error.message);
}

/**
 * Deletes the signed-in customer's account for real. Order matters: personal
 * data first (enquiries anonymised, marketing consents, availability alerts
 * and the app record deleted), the sign-in last. If any step fails the
 * customer can still sign in and retry, and every step is safe to run again.
 * Only reports `deleted: true` when the sign-in is gone too. Every failure,
 * thrown or returned, answers in JSON.
 */
export async function DELETE() {
  const user = await getSessionUser().catch(() => null);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ctx = { userId: user.id, role: user.role };

  try {
    await Repository.eraseOwnCustomerData(ctx, user.email);
    await deleteInterests(user.email);
  } catch (err) {
    // Refuse honestly (409) when this account cannot be erased automatically.
    if (err instanceof AppError && err.code === 'CONFLICT') {
      return NextResponse.json({ error: ACCOUNT_DELETE_MANUAL_MESSAGE }, { status: 409 });
    }
    console.error('[user/delete] data erasure failed for user', user.id, err);
    return NextResponse.json({ error: ACCOUNT_DELETE_NOT_FINISHED }, { status: 500 });
  }

  try {
    const { error: authError } = await createServiceRoleClient().auth.admin.deleteUser(user.id);
    if (authError) throw new Error(authError.message);
  } catch (err) {
    console.error('[user/delete] auth deletion failed for user', user.id, err);
    return NextResponse.json({ error: ACCOUNT_DELETE_NOT_FINISHED }, { status: 500 });
  }

  // The account is gone; a failed sign-out only leaves a dead cookie behind.
  try {
    await (await createClient()).auth.signOut();
  } catch (err) {
    console.error('[user/delete] sign-out after deletion failed for user', user.id, err);
  }
  return NextResponse.json({ deleted: true });
}
