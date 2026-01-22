import { EmailAlreadyExistsError } from '@/features/v1/auth/create-user/errors/email-already-exists-error'
import { ErrorResult } from '@/shared/result/errors'
import { HttpStatus } from '@/shared/result/http-status'

/**
 * Maps ErrorResult instances to HTTP status codes
 * Add your custom error mappings using instanceof checks
 */
export class ErrorResultToHttpStatusCode {
  /**
   * Maps an ErrorResult to its corresponding HTTP status code.
   * @param error - The error instance to map
   * @returns HTTP status code (default: 400 Bad Request)
   */
  static mapFrom(error: ErrorResult): HttpStatus {
    if (error instanceof EmailAlreadyExistsError) return HttpStatus.CONFLICT

    return HttpStatus.BAD_REQUEST
  }
}
