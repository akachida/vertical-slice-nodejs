---
trigger: always_on
---

# Result Pattern

## Overview

The Result pattern is a Rust-inspired approach to error handling that replaces traditional try-catch blocks with explicit return types. Instead of throwing exceptions, functions return a `Result<T, E>` class that encapsulates either a success value (Ok) or an error (Err).

## Why Result Pattern?

### Problems with try-catch

1. **Hidden control flow** - Exceptions can be thrown from anywhere, making code harder to reason about
2. **No type safety** - TypeScript can't enforce that exceptions are handled
3. **Implicit error handling** - Easy to forget to handle errors
4. **Performance overhead** - Exception handling has runtime cost

### Benefits of Result Pattern

1. **Explicit error handling** - Errors are part of the function signature
2. **Type safety** - TypeScript enforces handling both success and failure cases
3. **Composable** - Results can be chained and transformed
4. **Predictable** - No hidden control flow jumps

## Core Types

### Result Class

```typescript
class Result<T, E> {
  private readonly _isOk: boolean
  private readonly _value: T | undefined
  private readonly _error: E | undefined

  static ok<T, E = never>(value: T): Result<T, E>
  static err<E, T = never>(error: E): Result<T, E>
  static unit<E = never>(): Result<Unit, E>

  isOk(): boolean
  isErr(): boolean
  unwrap(): T
  unwrapOr(defaultValue: T): T
  unwrapOrElse(fn: (error: E) => T): T
  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U
}
```

### Unit Type

```typescript
// Unit type for commands that don't return a value
type Unit = void
```

### Creating Results

```typescript
import { Result, Unit } from '@/shared/result'

// Success case with data
const successResult = Result.ok({ id: '123', name: 'John' })

// Success case without data (for commands)
const unitResult = Result.unit()

// Failure case
const failureResult = Result.err(new EmailAlreadyExistsError())
```

## Error Types

### ErrorResult Base Class

All errors extend the `ErrorResult` base class:

```typescript
export class ErrorResult {
  readonly type: string
  readonly message: string
  readonly details: string[]

  constructor(message: string, details: string[]) {
    this.type = this.constructor.name
    this.message = message
    this.details = details
  }
}
```

### Creating Custom Errors

```typescript
import { ErrorResult } from '@/shared/result'

export class EmailAlreadyExistsError extends ErrorResult {
  private constructor() {
    super('User with this email already exists', [])
  }

  static emailAlreadyExists() {
    return new EmailAlreadyExistsError()
  }
}

export class InvalidEmailFormatError extends ErrorResult {
  private constructor(email: string) {
    super('Invalid email format', [`Email "${email}" is not valid`])
  }

  static invalidEmailFormat(email: string) {
    return new InvalidEmailFormatError(email)
  }
}
```

### HTTP Status Code Mapping

```typescript
import { ErrorResultToHttpStatusCode, HttpStatus } from '@/shared/result'

// Map error to HTTP status code
const statusCode = ErrorResultToHttpStatusCode.mapFrom(error)

// Available HttpStatus enum values:
// - HttpStatus.OK (200)
// - HttpStatus.CREATED (201)
// - HttpStatus.BAD_REQUEST (400)
// - HttpStatus.UNAUTHORIZED (401)
// - HttpStatus.FORBIDDEN (403)
// - HttpStatus.NOT_FOUND (404)
// - HttpStatus.CONFLICT (409)
// - HttpStatus.INTERNAL_SERVER_ERROR (500)
// ...
```

## Usage in Handlers

### Command Handler Example (Returning Unit)

```typescript
import { CommandHandler } from '@/shared/cqs'
import { ErrorResult, Result, Unit } from '@/shared/result'
import { EmailAlreadyExistsError } from './errors/EmailAlreadyExistsError'

export class CreateUserCommandHandler implements CommandHandler<CreateUserCommand, Unit, ErrorResult> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: CreateUserCommand): Promise<Result<Unit, ErrorResult>> {
    // Check for conflicts
    const existing = await this.userRepository.findByEmail(command.email)
    if (existing) {
      return Result.err(EmailAlreadyExistsError.create())
    }

    // Create and save
    const user = User.create(command.email, command.name)
    const saved = await this.userRepository.save(user)

    // Send welcome email
    await this.emailService.sendWelcomeEmail(saved.email, saved.name)

    // Return success without data
    return Result.unit()
  }
}
```

### Query Handler Example (Returning Data)

```typescript
import { QueryHandler } from '@/shared/cqs'
import { ErrorResult, Result } from '@/shared/result'
import { UserNotFoundError } from './errors/UserNotFoundError'

export class GetUserByIdQueryHandler implements QueryHandler<GetUserByIdQuery, UserDto, ErrorResult> {
  async execute(query: GetUserByIdQuery): Promise<Result<UserDto, ErrorResult>> {
    const user = await this.userRepository.findById(query.id)

    if (!user) {
      return Result.err(UserNotFoundError.create(query.id))
    }

    return Result.ok({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  }
}
```

## Usage in Controllers

Controllers use the `result.match()` method to handle Results:

```typescript
import { Request, Response } from 'express'
import { Mediator } from '@/shared/mediator'
import { ErrorResult, ErrorResultToHttpStatusCode, Unit } from '@/shared/result'

export class CreateUserController {
  constructor(private readonly mediator: Mediator) {}

  async handle(req: Request, res: Response): Promise<void> {
    const command = CreateUserCommand.from(req.body)
    const result = await this.mediator.send<Unit>(command)

    result.match({
      ok: (data) => {
        res.status(201).json(data)
      },
      err: (error: ErrorResult) => {
        const statusCode = ErrorResultToHttpStatusCode.mapFrom(error)
        res.status(statusCode).json(error)
      },
    })
  }
}
```

## Result Methods

### Type Checking

```typescript
// Check if result is Ok
if (result.isOk()) {
  console.log('Success!')
}

// Check if result is Err
if (result.isErr()) {
  console.log('Failed!')
}

// Check with predicate
if (result.isOkAnd((value) => value.age > 18)) {
  console.log('Adult user')
}

if (result.isErrAnd((error) => error.type === 'NotFoundError')) {
  console.log('Not found')
}
```

### Unwrapping Values

```typescript
// Unwrap - throws if Err
const value = result.unwrap()

// Unwrap with default
const value = result.unwrapOr({ id: 'default', name: 'Unknown' })

// Unwrap with function
const value = result.unwrapOrElse((error) => {
  console.error(error)
  return defaultValue
})

// Get Ok value as optional
const maybeValue = result.ok() // T | undefined

// Get Err value as optional
const maybeError = result.err() // E | undefined
```

### Pattern Matching

```typescript
// Match on result
const message = result.match({
  ok: (user) => `Welcome ${user.name}!`,
  err: (error) => `Error: ${error.message}`,
})
```

## Command Patterns

### Commands Returning Unit

Most commands don't need to return data - they just indicate success or failure:

```typescript
export class CreateUserCommand implements Command {
  constructor(
    public readonly email: string,
    public readonly name: string,
  ) {}
}

// Handler returns Unit
export class CreateUserCommandHandler implements CommandHandler<CreateUserCommand, Unit, ErrorResult> {
  async execute(command: CreateUserCommand): Promise<Result<Unit, ErrorResult>> {
    // ... business logic ...
    return Result.unit()
  }
}
```

### Commands Returning Data

Some commands need to return created data:

```typescript
export interface CreateUserResult {
  id: string
  email: string
  name: string
  createdAt: Date
}

export class CreateUserCommandHandler implements CommandHandler<CreateUserCommand, CreateUserResult, ErrorResult> {
  async execute(command: CreateUserCommand): Promise<Result<CreateUserResult, ErrorResult>> {
    const user = User.create(command.email, command.name)
    const saved = await this.userRepository.save(user)

    return Result.ok({
      id: saved.id,
      email: saved.email,
      name: saved.name,
      createdAt: saved.createdAt,
    })
  }
}
```

## Best Practices

### 1. Always Return Result from Handlers

```typescript
// ✅ Good
async execute(command: Command): Promise<Result<Unit, ErrorResult>> {
  return Result.unit()
}

// ❌ Bad - throws instead of returning Result.err
async execute(command: Command): Promise<Result<Unit, ErrorResult>> {
  throw new Error('Something went wrong')
}
```

### 2. Create Custom Error Classes

```typescript
// ✅ Good - custom error class
export class EmailAlreadyExistsError extends ErrorResult {
  private constructor() {
    super('User with this email already exists', [])
  }

  static emailAlreadyExists() {
    return new EmailAlreadyExistsError()
  }
}

return Result.err(EmailAlreadyExistsError.emailAlreadyExists())

// ❌ Bad - generic error
return Result.err(new ErrorResult('Something went wrong', []))
```

### 3. Handle All Cases in Controllers

```typescript
// ✅ Good - handles both cases
result.match({
  ok: (data) => res.status(200).json(data),
  err: (error) => {
    const statusCode = ErrorResultToHttpStatusCode.mapFrom(error)
    res.status(statusCode).json(error)
  },
})

// ❌ Bad - ignores error case
if (result.isOk()) {
  res.json(result.unwrap())
}
```

### 4. Use Unit for Commands Without Return Data

```typescript
// ✅ Good - explicit Unit type
async execute(command: Command): Promise<Result<Unit, ErrorResult>> {
  // ... business logic ...
  return Result.unit()
}

// ❌ Bad - unclear void type
async execute(command: Command): Promise<Result<void, ErrorResult>> {
  return Result.ok(undefined)
}
```

### 5. Map Errors to HTTP Status Codes when it's not 400 Bad Request

```typescript
// ✅ Good - use ErrorResultToHttpStatusCode
const statusCode = ErrorResultToHttpStatusCode.mapFrom(error)
res.status(statusCode).json(error)

// ❌ Bad - hardcoded status
res.status(500).json(error)
```

## File Structure

```text
src/shared/result/
├── index.ts                    # Public exports
├── result.ts                   # Result class
├── errors.ts                   # ErrorResult base class
├── http-status.ts              # HttpStatus enum
└── error-to-http-status.ts     # Error to HTTP status mapper
```
