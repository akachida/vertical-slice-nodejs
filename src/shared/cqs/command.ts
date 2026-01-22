import { Result, ErrorResult, Unit } from '@/shared/result'

/**
 * Base class for Commands representing write operations that mutate state.
 * Commands follow the Command pattern and should be named in imperative form.
 * Examples: CreateUser, UpdateOrder, DeleteProduct, SendEmail.
 */
export abstract class Command {
  public readonly _tag: string = 'Command' as const
}

/**
 * Handler interface for processing a specific Command type.
 * Implements the Command Handler pattern with functional error handling via Result.
 * @template TCommand - The command type this handler processes
 * @template TResult - The success result type (defaults to Unit for commands without return data)
 * @template TError - The error type (defaults to ErrorResult)
 */
export interface CommandHandler<TCommand extends Command, TResult = Unit, TError = ErrorResult> {
  /**
   * Executes the command and returns a Result.
   * @param command - The command instance to execute
   * @returns Result containing either success data or an error
   */
  execute(command: TCommand): Promise<Result<TResult, TError>>
}
