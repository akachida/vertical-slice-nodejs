import { Command, CommandHandler, Query, QueryHandler } from '@/shared/cqs'
import { ErrorResult, Result } from '@/shared/result'

/**
 * Union type representing any request that can be sent through the mediator.
 * Can be either a Command (write operation) or Query (read operation).
 */
export type Request = Command | Query

/**
 * Union type representing handlers that can process requests.
 * Supports both CommandHandler and QueryHandler with Result-based error handling.
 */
export type Handler<TRequest extends Request, TResult, TError = ErrorResult> =
  | CommandHandler<TRequest & Command, TResult, TError>
  | QueryHandler<TRequest & Query, TResult, TError>

/**
 * Mediator interface implementing the Mediator pattern.
 * Provides a central point for sending Commands and Queries to their handlers.
 * Decouples features from each other by routing requests through a single interface.
 */
export interface Mediator {
  /**
   * Sends a request (Command or Query) to its registered handler.
   * @template TResult - The expected success result type
   * @template TError - The expected error type (defaults to ErrorResult)
   * @param request - Command or Query instance to process
   * @returns Result containing either success data or an error
   */
  send<TResult, TError = ErrorResult>(request: Request): Promise<Result<TResult, TError>>
}

/**
 * In-memory implementation of the Mediator pattern.
 * Maintains a registry of handlers and routes requests to them based on request type name.
 * Thread-safe for single-threaded Node.js environment.
 */
export class InMemoryMediator implements Mediator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlers = new Map<string, Handler<any, any, any>>()

  /**
   * Registers a handler for a specific request type.
   * @param requestName - Unique identifier for the request type (typically the class name)
   * @param handler - Handler instance that will process requests of this type
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
   * Sends a request to its registered handler and returns the result.
   * @param request - Command or Query instance to be processed
   * @returns Result from the handler execution
   * @throws Error if no handler is registered for the request type
   */
  async send<TResult, TError = ErrorResult>(request: Request): Promise<Result<TResult, TError>> {
    const requestName = request.constructor.name
    const handler = this.handlers.get(requestName)

    if (!handler) {
      throw new Error(`No handler registered for ${requestName}`)
    }

    return handler.execute(request)
  }
}
