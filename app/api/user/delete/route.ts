import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { ACCOUNT_DELETE_MANUAL_MESSAGE, Repository } from '@/lib/api/repository';
import { AppError, mapErrorToResponse } from '@/lib/errors';

const AUTH_DELETE_FAILED =
  'We could not delete your account just now. Nothing has been deleted. Please try again, or email dpo@pilgrimcompare.co.uk.';

/**
 * Deletes the signed-in customer's account for real: the app user record and
 * the Supabase auth user. Only reports `deleted: true` when both are gone.
 * (Previously a failed dynamic import was swallowed and the route claimed
 * success while deleting nothing.)
 */
export async function DELETE() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const ctx = { userId: user.id, role: user.role };

    // 1. Refuse honestly (409) before touching anything if this account cannot
    //    be erased automatically.
    try {
      await Repository.assertCanDeleteOwnAccount(ctx);
    } catch (err) {
      if (err instanceof AppError && err.code === 'CONFLICT') {
        return NextResponse.json({ error: ACCOUNT_DELETE_MANUAL_MESSAGE }, { status: 409 });
      }
      throw err;
    }

    // 2. Remove the sign-in first so a half-finished deletion can never leave
    //    an account that still logs in.
    const { error: authError } = await createServiceRoleClient().auth.admin.deleteUser(user.id);
    if (authError) {
      console.error('[user/delete] auth deletion failed:', authError.message);
      return NextResponse.json({ error: AUTH_DELETE_FAILED }, { status: 500 });
    }

    // 3. Remove the app record.
    await Repository.deleteOwnCustomerRecord(ctx);

    const supabase = await createClient();
    await supabase.auth.signOut();
    return NextResponse.json({ deleted: true });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
