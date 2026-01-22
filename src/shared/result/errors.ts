/**
 * Application Error Types
 * Class-based error system for the Result pattern
 */

/**
 * Abstract base class for all application errors
 * Developers should extend this class to create custom domain-specific errors
 */
export abstract class ErrorResult extends Error {
  type: string
  details: string[]

  constructor(message: string, details: string[]) {
    super(message)
    this.name = this.constructor.name
    this.type = this.constructor.name
    this.details = details
  }
}
