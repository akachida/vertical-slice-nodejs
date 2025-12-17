/**
 * Result Pattern Implementation
 * Functional approach to error handling without try-catch
 */

/**
 * Represents a successful result containing a value
 */
export interface Success<T> {
  readonly _tag: 'Success'
  readonly value: T
}

/**
 * Represents a failed result containing an error
 */
export interface Failure<E> {
  readonly _tag: 'Failure'
  readonly error: E
}

/**
 * Result type - discriminated union of Success and Failure
 * @template T - The success value type
 * @template E - The error type
 */
export type Result<T, E> = Success<T> | Failure<E>

/**
 * Creates a successful Result
 */
export function success<T>(value: T): Success<T> {
  return { _tag: 'Success', value }
}

/**
 * Creates a failed Result
 */
export function failure<E>(error: E): Failure<E> {
  return { _tag: 'Failure', error }
}

/**
 * Type guard to check if a Result is a Success
 */
export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result._tag === 'Success'
}

/**
 * Type guard to check if a Result is a Failure
 */
export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result._tag === 'Failure'
}

/**
 * Maps the success value of a Result
 */
export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (isSuccess(result)) {
    return success(fn(result.value))
  }
  return result
}

/**
 * Maps the error of a Result
 */
export function mapError<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  if (isFailure(result)) {
    return failure(fn(result.error))
  }
  return result
}

/**
 * Chains Result-returning functions (flatMap/bind)
 */
export function flatMap<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
  if (isSuccess(result)) {
    return fn(result.value)
  }
  return result
}

/**
 * Unwraps a Result, returning the value or a default
 */
export function getOrElse<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (isSuccess(result)) {
    return result.value
  }
  return defaultValue
}

/**
 * Unwraps a Result, returning the value or computing a default from the error
 */
export function getOrElseWith<T, E>(result: Result<T, E>, fn: (error: E) => T): T {
  if (isSuccess(result)) {
    return result.value
  }
  return fn(result.error)
}

/**
 * Pattern matches on a Result
 */
export function match<T, E, U>(
  result: Result<T, E>,
  handlers: {
    onSuccess: (value: T) => U
    onFailure: (error: E) => U
  },
): U {
  if (isSuccess(result)) {
    return handlers.onSuccess(result.value)
  }
  return handlers.onFailure(result.error)
}

/**
 * Wraps a function that may throw into a Result-returning function
 */
export function tryCatch<T, E>(fn: () => T, onError: (error: unknown) => E): Result<T, E> {
  try {
    return success(fn())
  } catch (error) {
    return failure(onError(error))
  }
}

/**
 * Wraps an async function that may throw into a Result-returning function
 */
export async function tryCatchAsync<T, E>(fn: () => Promise<T>, onError: (error: unknown) => E): Promise<Result<T, E>> {
  try {
    const value = await fn()
    return success(value)
  } catch (error) {
    return failure(onError(error))
  }
}

/**
 * Combines multiple Results into a single Result containing an array
 * Returns Failure with the first error encountered
 */
export function combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = []

  for (const result of results) {
    if (isFailure(result)) {
      return result
    }
    values.push(result.value)
  }

  return success(values)
}

/**
 * Combines multiple Results, collecting all errors
 */
export function combineAll<T, E>(results: Result<T, E>[]): Result<T[], E[]> {
  const values: T[] = []
  const errors: E[] = []

  for (const result of results) {
    if (isFailure(result)) {
      errors.push(result.error)
    } else {
      values.push(result.value)
    }
  }

  if (errors.length > 0) {
    return failure(errors)
  }

  return success(values)
}
