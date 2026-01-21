/**
 * Result Pattern Implementation
 * Rust-inspired Result type for explicit error handling
 * @template T - The success value type (Ok)
 * @template E - The error type (Err)
 */

/**
 * Unit type for commands that don't return a value
 * Represents successful execution without a meaningful return value
 */
export type Unit = void

/**
 * Result class - Rust-inspired Result type
 * Encapsulates either a success value (Ok) or an error (Err)
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
   * Creates a successful Result (Ok variant)
   */
  static ok<T, E = never>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined)
  }

  /**
   * Creates a failed Result (Err variant)
   */
  static err<E, T = never>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error)
  }

  /**
   * Creates a successful Result with no value (Unit/void)
   * Useful for commands that don't return data
   */
  static unit<E = never>(): Result<Unit, E> {
    return new Result<Unit, E>(true, undefined, undefined)
  }

  /**
   * Returns true if the result is Ok
   */
  isOk(): boolean {
    return this._isOk
  }

  /**
   * Returns true if the result is Err
   */
  isErr(): boolean {
    return !this._isOk
  }

  /**
   * Returns true if the result is Ok and the value satisfies the predicate
   */
  isOkAnd(predicate: (value: T) => boolean): boolean {
    return this._isOk && predicate(this._value as T)
  }

  /**
   * Returns true if the result is Err and the error satisfies the predicate
   */
  isErrAnd(predicate: (error: E) => boolean): boolean {
    return !this._isOk && predicate(this._error as E)
  }

  /**
   * Returns the contained Ok value.
   * Throws if the result is Err.
   */
  unwrap(): T {
    if (this._isOk) {
      return this._value as T
    }
    throw new Error(`Called unwrap on an Err value: ${JSON.stringify(this._error)}`)
  }

  /**
   * Returns the contained Ok value or a provided default.
   */
  unwrapOr(defaultValue: T): T {
    return this._isOk ? (this._value as T) : defaultValue
  }

  /**
   * Returns the contained Ok value or computes it from a closure.
   */
  unwrapOrElse(fn: (error: E) => T): T {
    return this._isOk ? (this._value as T) : fn(this._error as E)
  }

  /**
   * Returns the contained Err value.
   * Throws if the result is Ok.
   */
  unwrapErr(): E {
    if (!this._isOk) {
      return this._error as E
    }
    throw new Error(`Called unwrapErr on an Ok value: ${JSON.stringify(this._value)}`)
  }

  /**
   * Converts from Result<T, E> to T | undefined.
   * Returns the Ok value or undefined.
   */
  ok(): T | undefined {
    return this._isOk ? (this._value as T) : undefined
  }

  /**
   * Converts from Result<T, E> to E | undefined.
   * Returns the Err value or undefined.
   */
  err(): E | undefined {
    return this._isOk ? undefined : (this._error as E)
  }

  /**
   * Pattern matches on the Result, executing the appropriate handler.
   */
  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return this._isOk ? handlers.ok(this._value as T) : handlers.err(this._error as E)
  }
}
