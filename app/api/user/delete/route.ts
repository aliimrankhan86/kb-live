import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { ACCOUNT_DELETE_MANUAL_MESSAGE, Repository } from '@/lib/api/repository';
import { AppError } from '@/lib/errors';

const NOT_FINISHED =
  'We could not finish deleting your account. You can still sign in, so please try again. If it keeps failing, email dpo@pilgrimcompare.co.uk.';

/**
 * Deletes the signed-in customer's account for real. Order matters: personal
 * data first (enquiries anonymised, marketing consents and the app record
 * deleted), the sign-in last. If any step fails the customer can still sign
 * in and retry, and every step is safe to run again. Only reports
 * `deleted: true` when the sign-in is gone too.
 */
export async function DELETE() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ctx = { userId: user.id, role: user.role };

  try {
    await Repository.eraseOwnCustomerData(ctx, user.email);
  } catch (err) {
    // Refuse honestly (409) when this account cannot be erased automatically.
    if (err instanceof AppError && err.code === 'CONFLICT') {
      return NextResponse.json({ error: ACCOUNT_DELETE_MANUAL_MESSAGE }, { status: 409 });
    }
    console.error('[user/delete] data erasure failed for user', user.id, err);
    return NextResponse.json({ error: NOT_FINISHED }, { status: 500 });
  }

  const { error: authError } = await createServiceRoleClient().auth.admin.deleteUser(user.id);
  if (authError) {
    console.error('[user/delete] auth deletion failed for user', user.id, authError.message);
    return NextResponse.json({ error: NOT_FINISHED }, { status: 500 });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ deleted: true });
}
