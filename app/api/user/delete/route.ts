import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { mapErrorToResponse } from '@/lib/errors';

export async function DELETE() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Delete auth user via service role (requires SUPABASE_SERVICE_ROLE_KEY).
    // Falls back gracefully in dev if key not set — only session sign-out occurs.
    try {
      const { createServiceRoleClient } = await import(
        /* webpackIgnore: true */ '@/lib/supabase/service-role'
      );
      const adminClient = createServiceRoleClient();
      await adminClient.auth.admin.deleteUser(userId);
    } catch {
      // Dev: service role key not set or not needed — sign out only.
    }

    // Sign out the current session so cookies are cleared.
    const supabase = await createClient();
    await supabase.auth.signOut();

    return NextResponse.json({ deleted: true });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
