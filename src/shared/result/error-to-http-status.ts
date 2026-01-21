import { ErrorResult } from '@/shared/result/errors'
import { HttpStatus } from '@/shared/result/http-status'

/**
 * Maps ErrorResult instances to HTTP status codes
 * Add your custom error mappings using instanceof checks
 */
export class ErrorResultToHttpStatusCode {
  /**
   * Maps an ErrorResult to its corresponding HTTP status code
   * @param error - The error instance to map
   * @returns HTTP status code (default: 400 Bad Request)
   */
  static mapFrom(_error: ErrorResult): HttpStatus {
    // Add your custom error mappings here using instanceof
    // Example:
    // if (error instanceof UserNotFoundError) return HttpStatus.NOT_FOUND
    // if (error instanceof UnauthorizedAccessError) return HttpStatus.UNAUTHORIZED
    // if (error instanceof ForbiddenAccessError) return HttpStatus.FORBIDDEN
    // if (error instanceof UpdateSimulationNotAllowedError) return HttpStatus.CONFLICT
    // if (error instanceof FailedToGenerateSimulationPdfError) return HttpStatus.INTERNAL_SERVER_ERROR

    return HttpStatus.BAD_REQUEST
  }
}
