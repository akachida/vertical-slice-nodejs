import { Result, ErrorResult, Unit } from '@/shared/result'

/**
 * Base interface for Commands (write operations that mutate state)
 * Commands should be named in imperative form: CreateUser, DeleteOrder, etc.
 */
export abstract class Command {
  public readonly _tag: string = 'Command' as const
}

/**
 * Handler for processing a specific Command type
 * Returns a Result type for functional error handling
 * @template TCommand - The command type this handler processes
 * @template TError - The error type (defaults to ErrorResult)
 */
export interface CommandHandler<TCommand extends Command, TResult = Unit, TError = ErrorResult> {
  execute(command: TCommand): Promise<Result<TResult, TError>>
}
