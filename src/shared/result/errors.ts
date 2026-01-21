/**
 * Application Error Types
 * Class-based error system for the Result pattern
 */

/**
 * Abstract base class for all application errors
 * Developers should extend this class to create custom domain-specific errors
 */
export abstract class ErrorResult {
  type: string
  message: string
  details: string[]

  constructor(message: string, details: string[]) {
    this.type = this.constructor.name
    this.message = message
    this.details = details
  }
}
