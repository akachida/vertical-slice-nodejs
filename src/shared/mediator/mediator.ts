import { Command, CommandHandler, Query, QueryHandler } from '@/shared/cqs'
import { ErrorResult, Result } from '@/shared/result'

/**
 * Request type that can be either a Command or Query
 */
export type Request = Command | Query

/**
 * Handler type that can process Commands or Queries
 * Now returns Result for functional error handling
 */
export type Handler<TRequest extends Request, TResult, TError = ErrorResult> =
  | CommandHandler<TRequest & Command, TResult, TError>
  | QueryHandler<TRequest & Query, TResult, TError>

/**
 * Mediator interface for sending Commands and Queries
 * Returns Result type for functional error handling
 */
export interface Mediator {
  send<TResult, TError = ErrorResult>(request: Request): Promise<Result<TResult, TError>>
}

/**
 * Simple in-memory Mediator implementation
 * Routes requests to their registered handlers
 */
export class InMemoryMediator implements Mediator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlers = new Map<string, Handler<any, any, any>>()

  /**
   * Register a handler for a specific request type
   * @param requestName - Unique identifier for the request type
   * @param handler - Handler instance that will process the request
   * @throws Error if a handler is already registered for the request type
   */
  register<TRequest extends Request, TResult, TError = ErrorResult>(
    requestName: string,
    handler: Handler<TRequest, TResult, TError>,
  ): void {
    if (this.handlers.has(requestName)) {
      throw new Error(`Handler for ${requestName} is already registered`)
    }

    this.handlers.set(requestName, handler)
  }

  /**
   * Send a request to its registered handler
   * @param request - Command or Query to be processed
   * @returns Result from the handler execution
   * @throws Error if no handler is registered for the request type
   */
  async send<TResult, TError = ErrorResult>(
    request: Request,
  ): Promise<Result<TResult, TError>> {
    const requestName = request.constructor.name
    const handler = this.handlers.get(requestName)

    if (!handler) {
      throw new Error(`No handler registered for ${requestName}`)
    }

    return handler.execute(request)
  }
}
