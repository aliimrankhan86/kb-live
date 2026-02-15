/**
 * Safely extract a human-readable message from an unknown error value.
 * Used by app/error.tsx and app/global-error.tsx.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  const s = String(error);
  if (s === '[object Event]') return 'An unexpected error occurred.';
  return s || 'An unexpected error occurred.';
}
