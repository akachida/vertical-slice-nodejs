/**
 * Unit type representing successful execution without a meaningful return value.
 * Used primarily for Commands that perform actions but don't return data.
 * Equivalent to void but more semantically meaningful in the Result context.
 */
export type Unit = void

/**
 * Result class implementing the Result pattern inspired by Rust.
 * Provides type-safe error handling by encapsulating either a success value (Ok) or an error (Err).
 * Eliminates the need for try-catch blocks and makes error handling explicit in function signatures.
 * @template T - The success value type (Ok variant)
 * @template E - The error type (Err variant)
 */
export class Result<T, E> {
  private readonly _isOk: boolean
  private readonly _value: T | undefined
  private readonly _error: E | undefined

  constructor(isOk: boolean, value?: T, error?: E) {
    this._isOk = isOk
    this._value = value
    this._error = error
  }

  /**
   * Creates a successful Result containing a value (Ok variant).
   * @template T - The success value type
   * @template E - The error type (defaults to never)
   * @param value - The success value to wrap
   * @returns Result in the Ok state
   */
  static ok<T, E = never>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined)
  }

  /**
   * Creates a failed Result containing an error (Err variant).
   * @template E - The error type
   * @template T - The success value type (defaults to never)
   * @param error - The error to wrap
   * @returns Result in the Err state
   */
  static err<E, T = never>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error)
  }

  /**
   * Creates a successful Result with no value (Unit/void).
   * Used for Commands that perform actions but don't return meaningful data.
   * @template E - The error type (defaults to never)
   * @returns Result in the Ok state with Unit value
   */
  static unit<E = never>(): Result<Unit, E> {
    return new Result<Unit, E>(true, undefined, undefined)
  }

  /**
   * Checks if the result is in the Ok state.
   * @returns true if Ok, false if Err
   */
  isOk(): boolean {
    return this._isOk
  }

  /**
   * Checks if the result is in the Err state.
   * @returns true if Err, false if Ok
   */
  isErr(): boolean {
    return !this._isOk
  }

  /**
   * Checks if the result is Ok and the value satisfies the predicate.
   * @param predicate - Function to test the Ok value
   * @returns true if Ok and predicate returns true, false otherwise
   */
  isOkAnd(predicate: (value: T) => boolean): boolean {
    return this._isOk && predicate(this._value as T)
  }

  /**
   * Checks if the result is Err and the error satisfies the predicate.
   * @param predicate - Function to test the Err value
   * @returns true if Err and predicate returns true, false otherwise
   */
  isErrAnd(predicate: (error: E) => boolean): boolean {
    return !this._isOk && predicate(this._error as E)
  }

  /**
   * Unwraps the Result, returning the Ok value.
   * @throws Error if the result is Err
   * @returns The Ok value
   */
  unwrap(): T {
    if (this._isOk) {
      return this._value as T
    }
    throw new Error(`Called unwrap on an Err value: ${JSON.stringify(this._error)}`)
  }

  /**
   * Returns the Ok value or a provided default if Err.
   * @param defaultValue - Value to return if Result is Err
   * @returns The Ok value or the default
   */
  unwrapOr(defaultValue: T): T {
    return this._isOk ? (this._value as T) : defaultValue
  }

  /**
   * Returns the Ok value or computes it from the error using a function.
   * @param fn - Function that computes a value from the error
   * @returns The Ok value or the computed value
   */
  unwrapOrElse(fn: (error: E) => T): T {
    return this._isOk ? (this._value as T) : fn(this._error as E)
  }

  /**
   * Unwraps the Result, returning the Err value.
   * @throws Error if the result is Ok
   * @returns The Err value
   */
  unwrapErr(): E {
    if (!this._isOk) {
      return this._error as E
    }
    throw new Error(`Called unwrapErr on an Ok value: ${JSON.stringify(this._value)}`)
  }

  /**
   * Converts the Result to an optional Ok value.
   * @returns The Ok value if Ok, undefined if Err
   */
  ok(): T | undefined {
    return this._isOk ? (this._value as T) : undefined
  }

  /**
   * Converts the Result to an optional Err value.
   * @returns The Err value if Err, undefined if Ok
   */
  err(): E | undefined {
    return this._isOk ? undefined : (this._error as E)
  }

  /**
   * Maps an `Ok` value to a new `Result` containing a different value type `U`.
   * If `Result` is `Err`, it returns the `Err` value unchanged.
   * @template U - The new success value type
   * @param fn - The mapping function to apply to the `Ok` value
   * @returns A new `Result` with the transformed `Ok` value, or the original `Err`
   */
  map<U>(fn: (value: T) => U): Result<U, E> {
    return this._isOk ? Result.ok(fn(this._value as T)) : Result.err<E, U>(this._error as E)
  }

  /**
   * Maps an `Ok` value to a new `Result` of type `Result<U, E>`.
   * This is useful for chaining operations that themselves return `Result`.
   * If `Result` is `Err`, it returns the `Err` value unchanged.
   * @template U - The new success value type
   * @param fn - The mapping function to apply to the `Ok` value
   * @returns A new `Result` (which can be Ok or Err) with the transformed value, or the original `Err`
   */
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this._isOk ? fn(this._value as T) : Result.err<E, U>(this._error as E)
  }

  /**
   * Maps an `Err` value to a new `Result` containing a different error type `F`.
   * If `Result` is `Ok`, it returns the `Ok` value unchanged.
   * @template F - The new error type
   * @param fn - The mapping function to apply to the `Err` value
   * @returns A new `Result` with the transformed `Err` value, or the original `Ok`
   */
  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    return this._isOk ? Result.ok<T, F>(this._value as T) : Result.err(fn(this._error as E))
  }

  /**
   * Pattern matches on the Result, executing the appropriate handler.
   * Provides a type-safe way to handle both Ok and Err cases.
   * @template U - The return type of the handlers
   * @param handlers - Object with ok and err handler functions
   * @returns The result of executing the appropriate handler
   */
  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return this._isOk ? handlers.ok(this._value as T) : handlers.err(this._error as E)
  }
}
