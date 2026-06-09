/**
 * Application error codes and typed error class.
 * Internal error codes are mapped to user-facing messages at the API boundary.
 * Never expose raw internal error messages directly to clients.
 */

export type ErrorCode =
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_EMAIL_NOT_CONFIRMED'
  | 'AUTH_EMAIL_NOT_VERIFIED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'OPERATOR_NOT_ELIGIBLE'
  | 'ACTIVE_PAYMENT_DETAILS_EXIST'
  | 'BANK_CHANGE_PENDING'
  | 'BOOKING_INTENT_NOT_FOUND'
  | 'EVIDENCE_PURGED'
  | 'REFERENCE_CODE_EXISTS'
  | 'RATE_LIMITED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

const USER_FACING_MESSAGES: Record<ErrorCode, string> = {
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password.',
  AUTH_EMAIL_NOT_CONFIRMED: 'Please verify your email address before signing in. Check your inbox for a verification link.',
  AUTH_EMAIL_NOT_VERIFIED: 'Please verify your email address before performing this action.',
  UNAUTHORIZED: 'You are not authorised to perform this action.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  OPERATOR_NOT_ELIGIBLE: 'This operator is not currently accepting bookings.',
  ACTIVE_PAYMENT_DETAILS_EXIST: 'Active payment details already exist. Please request a bank change instead.',
  BANK_CHANGE_PENDING: 'A bank change request is already pending review.',
  BOOKING_INTENT_NOT_FOUND: 'Booking request not found.',
  EVIDENCE_PURGED: 'Payment evidence has been removed after the retention period.',
  REFERENCE_CODE_EXISTS: 'A reference code conflict occurred. Please try again.',
  RATE_LIMITED: 'Too many attempts. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'A conflict occurred. Please refresh and try again.',
  INTERNAL_ERROR: 'Something went wrong. Please try again later.',
};

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly isOperational: boolean;

  constructor({
    code,
    message,
    status = 400,
    isOperational = true,
  }: {
    code: ErrorCode;
    message?: string;
    status?: number;
    isOperational?: boolean;
  }) {
    super(message || USER_FACING_MESSAGES[code]);
    this.code = code;
    this.status = status;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      error: USER_FACING_MESSAGES[this.code],
      code: this.code,
    };
  }
}

/**
 * Map any thrown error to a safe JSON response.
 * AppErrors expose their code; unexpected errors are masked.
 */
export function mapErrorToResponse(err: unknown): { body: { error: string; code?: string }; status: number } {
  if (err instanceof AppError) {
    return { body: err.toJSON(), status: err.status };
  }

  if (err instanceof Error) {
    // Mask unexpected errors in production
    return {
      body: { error: USER_FACING_MESSAGES.INTERNAL_ERROR },
      status: 500,
    };
  }

  return {
    body: { error: USER_FACING_MESSAGES.INTERNAL_ERROR },
    status: 500,
  };
}
