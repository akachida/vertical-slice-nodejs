import { DomainError, Result } from '@/shared/result'

/**
 * Base interface for Commands (write operations that mutate state)
 * Commands should be named in imperative form: CreateUser, DeleteOrder, etc.
 */
export interface Command {
  readonly _tag: 'Command'
}

/**
 * Handler for processing a specific Command type
 * Returns a Result type for functional error handling
 * @template TCommand - The command type this handler processes
 * @template TResult - The success result type
 * @template TError - The error type (defaults to DomainError)
 */
export interface CommandHandler<TCommand extends Command, TResult = void, TError = DomainError> {
  execute(command: TCommand): Promise<Result<TResult, TError>>
}
