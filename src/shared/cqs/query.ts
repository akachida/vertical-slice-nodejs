import { DomainError, Result } from '@/shared/result'

/**
 * Base interface for Queries (read operations that don't mutate state)
 * Queries should be named as questions: GetUserById, ListOrders, etc.
 */
export interface Query {
  readonly _tag: 'Query'
}

/**
 * Handler for processing a specific Query type
 * Returns a Result type for functional error handling
 * @template TQuery - The query type this handler processes
 * @template TResult - The success result type
 * @template TError - The error type (defaults to DomainError)
 */
export interface QueryHandler<TQuery extends Query, TResult, TError = DomainError> {
  execute(query: TQuery): Promise<Result<TResult, TError>>
}
