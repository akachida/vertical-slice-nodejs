import { ErrorResult } from '@/shared/result'

/**
 * Error indicating that a user with the specified email already exists.
 * Maps to HTTP 409 Conflict status code.
 */
export class EmailAlreadyExistsError extends ErrorResult {
  private constructor() {
    super('Email already exists', [])
  }

  /**
   * Creates a new EmailAlreadyExistsError instance.
   */
  static default() {
    return new EmailAlreadyExistsError()
  }
}
