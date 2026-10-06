/** Returned when deletion did not finish. Never claims success. */
export const ACCOUNT_DELETE_NOT_FINISHED =
  'We could not finish deleting your account. You can still sign in, so please try again. If it keeps failing, email dpo@pilgrimcompare.co.uk.';

/** Shown when the reply is not readable (a timeout page, say), so we cannot know how far deletion got. */
export const ACCOUNT_DELETE_UNCONFIRMED =
  'We could not confirm that your account was deleted. If you can still sign in, please try again. If it keeps failing, email dpo@pilgrimcompare.co.uk.';

/** The server's honest error message, or ACCOUNT_DELETE_UNCONFIRMED when the reply is not JSON. Never a parse error. */
export async function deleteErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: unknown };
    if (typeof data?.error === 'string' && data.error) return data.error;
  } catch {
    // Not JSON: fall through to the honest fallback.
  }
  return ACCOUNT_DELETE_UNCONFIRMED;
}
