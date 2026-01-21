import { ErrorResult, Result } from '@/shared/result'

/**
 * Base interface for Queries (read operations that don't mutate state)
 * Queries should be named as questions: GetUserById, ListOrders, etc.
 */
export abstract class Query {
  public readonly _tag: string = 'Query' as const
}

/**
 * Handler for processing a specific Query type
 * Returns a Result type for functional error handling
 * @template TQuery - The query type this handler processes
 * @template TResult - The success result type
 * @template TError - The error type (defaults to ErrorResult)
 */
export interface QueryHandler<TQuery extends Query, TResult, TError = ErrorResult> {
  execute(query: TQuery): Promise<Result<TResult, TError>>
}
