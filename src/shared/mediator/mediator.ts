import { Command, CommandHandler, Query, QueryHandler, isTransactionalCommand } from '@/shared/cqs'
import { ErrorResult, Result } from '@/shared/result'
import { IUnitOfWorkFactory } from '@/shared/db/unit-of-work'

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
 * Supports automatic transaction management for commands marked as transactional.
 */
export class InMemoryMediator implements Mediator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlers = new Map<string, Handler<any, any, any>>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlerFactories = new Map<string, () => Handler<any, any, any>>()
  private unitOfWorkFactory?: IUnitOfWorkFactory

  /**
   * Sets the Unit of Work factory for transactional command handling
   * @param factory - Factory that creates Unit of Work instances
   */
  setUnitOfWorkFactory(factory: IUnitOfWorkFactory): void {
    this.unitOfWorkFactory = factory
  }

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
    if (this.handlers.has(requestName) || this.handlerFactories.has(requestName)) {
      throw new Error(`Handler for ${requestName} is already registered`)
    }

    this.handlers.set(requestName, handler)
  }

  /**
   * Registers a handler factory for a specific request type.
   * Useful when handlers need fresh instances per request (e.g., for Unit of Work)
   * @param requestName - Unique identifier for the request type
   * @param factory - Factory function that creates handler instances
   */
  registerFactory<TRequest extends Request, TResult, TError = ErrorResult>(
    requestName: string,
    factory: () => Handler<TRequest, TResult, TError>,
  ): void {
    if (this.handlers.has(requestName) || this.handlerFactories.has(requestName)) {
      throw new Error(`Handler for ${requestName} is already registered`)
    }

    this.handlerFactories.set(requestName, factory)
  }

  /**
   * Sends a request to its registered handler and returns the result.
   * For transactional commands, automatically wraps execution in a Unit of Work.
   * @param request - Command or Query instance to be processed
   * @returns Result from the handler execution
   * @throws Error if no handler is registered for the request type
   */
  async send<TResult, TError = ErrorResult>(request: Request): Promise<Result<TResult, TError>> {
    const requestName = request.constructor.name

    const factory = this.handlerFactories.get(requestName)
    const handler = factory ? factory() : this.handlers.get(requestName)

    if (!handler) {
      throw new Error(`No handler registered for ${requestName}`)
    }

    if (request instanceof Command && isTransactionalCommand(request)) {
      return this.executeInTransaction(handler, request)
    }

    return handler.execute(request)
  }

  /**
   * Executes a handler within a Unit of Work transaction
   * Automatically commits on Result.ok() and rolls back on Result.err()
   */
  private async executeInTransaction<TResult, TError = ErrorResult>(
    handler: Handler<Request, TResult, TError>,
    request: Request,
  ): Promise<Result<TResult, TError>> {
    if (!this.unitOfWorkFactory) {
      throw new Error(
        'UnitOfWorkFactory not configured. Call setUnitOfWorkFactory() before using transactional commands.',
      )
    }

    const unitOfWork = this.unitOfWorkFactory.create()

    return unitOfWork.executeInTransaction(async () => {
      return handler.execute(request)
    })
  }
}
