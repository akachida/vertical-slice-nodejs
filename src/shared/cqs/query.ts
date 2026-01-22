import { ErrorResult, Result } from '@/shared/result'

/**
 * Base class for Queries representing read operations that don't mutate state.
 * Queries follow the Query pattern and should be named as questions.
 * Examples: GetUserById, ListOrders, FindProductsByCategory, SearchUsers.
 */
export abstract class Query {
  public readonly _tag: string = 'Query' as const
}

/**
 * Handler interface for processing a specific Query type.
 * Implements the Query Handler pattern with functional error handling via Result.
 * @template TQuery - The query type this handler processes
 * @template TResult - The success result type (always required for queries)
 * @template TError - The error type (defaults to ErrorResult)
 */
export interface QueryHandler<TQuery extends Query, TResult, TError = ErrorResult> {
  /**
   * Executes the query and returns a Result.
   * @param query - The query instance to execute
   * @returns Result containing either the queried data or an error
   */
  execute(query: TQuery): Promise<Result<TResult, TError>>
}
