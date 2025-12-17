/**
 * Application Error Types
 * Structured error types for the Result pattern
 */

/**
 * Base application error interface
 */
export interface ApplicationError {
  readonly code: string
  readonly message: string
}

/**
 * Validation error - invalid input data
 */
export interface ValidationError extends ApplicationError {
  readonly code: 'VALIDATION_ERROR'
  readonly details?: Record<string, string[]>
}

/**
 * Not found error - resource doesn't exist
 */
export interface NotFoundError extends ApplicationError {
  readonly code: 'NOT_FOUND'
  readonly resource: string
}

/**
 * Conflict error - resource already exists or state conflict
 */
export interface ConflictError extends ApplicationError {
  readonly code: 'CONFLICT'
  readonly resource: string
}

/**
 * Unauthorized error - authentication required
 */
export interface UnauthorizedError extends ApplicationError {
  readonly code: 'UNAUTHORIZED'
}

/**
 * Forbidden error - insufficient permissions
 */
export interface ForbiddenError extends ApplicationError {
  readonly code: 'FORBIDDEN'
}

/**
 * Internal error - unexpected system error
 */
export interface InternalError extends ApplicationError {
  readonly code: 'INTERNAL_ERROR'
  readonly cause?: unknown
}

/**
 * Union of all application errors
 */
export type DomainError =
  | ValidationError
  | NotFoundError
  | ConflictError
  | UnauthorizedError
  | ForbiddenError
  | InternalError

/**
 * Error factory functions
 */
export const Errors = {
  validation(message: string, details?: Record<string, string[]>): ValidationError {
    return { code: 'VALIDATION_ERROR', message, details }
  },

  notFound(resource: string, message?: string): NotFoundError {
    return {
      code: 'NOT_FOUND',
      resource,
      message: message ?? `${resource} not found`,
    }
  },

  conflict(resource: string, message?: string): ConflictError {
    return {
      code: 'CONFLICT',
      resource,
      message: message ?? `${resource} already exists`,
    }
  },

  unauthorized(message = 'Authentication required'): UnauthorizedError {
    return { code: 'UNAUTHORIZED', message }
  },

  forbidden(message = 'Insufficient permissions'): ForbiddenError {
    return { code: 'FORBIDDEN', message }
  },

  internal(message: string, cause?: unknown): InternalError {
    return { code: 'INTERNAL_ERROR', message, cause }
  },
}

/**
 * Maps error codes to HTTP status codes
 */
export function errorToHttpStatus(error: DomainError): number {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      return 400
    case 'UNAUTHORIZED':
      return 401
    case 'FORBIDDEN':
      return 403
    case 'NOT_FOUND':
      return 404
    case 'CONFLICT':
      return 409
    case 'INTERNAL_ERROR':
      return 500
    default:
      return 500
  }
}

/**
 * Formats error for HTTP response
 */
export function errorToResponse(error: DomainError): {
  status: number
  body: { code: string; message: string; details?: Record<string, string[]> }
} {
  const status = errorToHttpStatus(error)
  const body: { code: string; message: string; details?: Record<string, string[]> } = {
    code: error.code,
    message: error.message,
  }

  if (error.code === 'VALIDATION_ERROR' && error.details) {
    body.details = error.details
  }

  return { status, body }
}
