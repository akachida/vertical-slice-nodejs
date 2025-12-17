# Result Pattern

## Overview

The Result pattern is a functional programming approach to error handling that replaces traditional try-catch blocks with explicit return types. Instead of throwing exceptions, functions return a `Result<T, E>` type that can be either a `Success<T>` or `Failure<E>`.

## Why Result Pattern?

### Problems with try-catch

1. **Hidden control flow** - Exceptions can be thrown from anywhere, making code harder to reason about
2. **No type safety** - TypeScript can't enforce that exceptions are handled
3. **Implicit error handling** - Easy to forget to handle errors
4. **Performance overhead** - Exception handling has runtime cost

### Benefits of Result Pattern

1. **Explicit error handling** - Errors are part of the function signature
2. **Type safety** - TypeScript enforces handling both success and failure cases
3. **Composable** - Results can be chained and transformed functionally
4. **Predictable** - No hidden control flow jumps

## Core Types

### Result Type

```typescript
type Result<T, E> = Success<T> | Failure<E>

interface Success<T> {
  readonly _tag: 'Success'
  readonly value: T
}

interface Failure<E> {
  readonly _tag: 'Failure'
  readonly error: E
}
```

### Creating Results

```typescript
import { success, failure } from '@/shared/result'

// Success case
const successResult = success({ id: '123', name: 'John' })

// Failure case
const failureResult = failure(Errors.notFound('User'))
```

## Error Types

The `DomainError` union type provides structured error handling:

```typescript
type DomainError =
  | ValidationError // 400 - Invalid input
  | UnauthorizedError // 401 - Authentication required
  | ForbiddenError // 403 - Insufficient permissions
  | NotFoundError // 404 - Resource not found
  | ConflictError // 409 - Resource conflict
  | InternalError // 500 - System error
```

### Error Factory

Use the `Errors` factory for creating errors:

```typescript
import { Errors } from '@/shared/result'

Errors.validation('Invalid email format', { email: ['Must be a valid email'] })
Errors.notFound('User', 'User with ID 123 not found')
Errors.conflict('User', 'User with this email already exists')
Errors.unauthorized('Token expired')
Errors.forbidden('Admin access required')
Errors.internal('Database connection failed', originalError)
```

## Usage in Handlers

### Command Handler Example

```typescript
import { CommandHandler } from '@/shared/cqs'
import { DomainError, Errors, failure, Result, success } from '@/shared/result'

export class CreateUserCommandHandler implements CommandHandler<CreateUserCommand, CreateUserResult, DomainError> {
  async execute(command: CreateUserCommand): Promise<Result<CreateUserResult, DomainError>> {
    // Check for conflicts
    const existing = await this.userRepository.findByEmail(command.email)
    if (existing) {
      return failure(Errors.conflict('User', 'User with this email already exists'))
    }

    // Create and save
    const user = User.create(command.email, command.name)
    const saved = await this.userRepository.save(user)

    // Return success
    return success({
      id: saved.id,
      email: saved.email,
      name: saved.name,
      createdAt: saved.createdAt,
    })
  }
}
```

### Query Handler Example

```typescript
export class GetUserByIdQueryHandler implements QueryHandler<GetUserByIdQuery, UserDto, DomainError> {
  async execute(query: GetUserByIdQuery): Promise<Result<UserDto, DomainError>> {
    const user = await this.userRepository.findById(query.id)

    if (!user) {
      return failure(Errors.notFound('User', `User with ID ${query.id} not found`))
    }

    return success({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  }
}
```

## Usage in Controllers

Controllers use the `match` function to handle Results:

```typescript
import { match, errorToResponse, DomainError } from '@/shared/result'

async handle(req: Request, res: Response): Promise<void> {
  const command = CreateUserCommand.fromInput(req.body)
  const result = await this.mediator.send<CreateUserResult, DomainError>(command)

  match(result, {
    onSuccess: (data) => {
      res.status(201).json(data)
    },
    onFailure: (error) => {
      const { status, body } = errorToResponse(error)
      res.status(status).json(body)
    },
  })
}
```

## Utility Functions

### Type Guards

```typescript
import { isSuccess, isFailure } from '@/shared/result'

if (isSuccess(result)) {
  console.log(result.value) // TypeScript knows this is Success<T>
}

if (isFailure(result)) {
  console.log(result.error) // TypeScript knows this is Failure<E>
}
```

### Transformations

```typescript
import { map, mapError, flatMap } from '@/shared/result'

// Transform success value
const mapped = map(result, (user) => user.name)

// Transform error
const mappedError = mapError(result, (error) => ({ ...error, timestamp: new Date() }))

// Chain Result-returning functions
const chained = flatMap(result, (user) => validateUser(user))
```

### Default Values

```typescript
import { getOrElse, getOrElseWith } from '@/shared/result'

// Get value or default
const name = getOrElse(result, 'Unknown')

// Get value or compute from error
const name = getOrElseWith(result, (error) => `Error: ${error.message}`)
```

### Combining Results

```typescript
import { combine, combineAll } from '@/shared/result'

// Fails fast on first error
const combined = combine([result1, result2, result3])

// Collects all errors
const combinedAll = combineAll([result1, result2, result3])
```

### Wrapping Unsafe Code

```typescript
import { tryCatch, tryCatchAsync } from '@/shared/result'

// Synchronous
const result = tryCatch(
  () => JSON.parse(jsonString),
  (error) => Errors.validation('Invalid JSON'),
)

// Asynchronous
const result = await tryCatchAsync(
  () => fetch(url).then((r) => r.json()),
  (error) => Errors.internal('Network error', error),
)
```

## Best Practices

### 1. Always Return Result from Handlers

```typescript
// ✅ Good
async execute(command: Command): Promise<Result<Data, DomainError>> {
  return success(data)
}

// ❌ Bad - throws instead of returning failure
async execute(command: Command): Promise<Result<Data, DomainError>> {
  throw new Error('Something went wrong')
}
```

### 2. Use Specific Error Types

```typescript
// ✅ Good - specific error type
return failure(Errors.notFound('User', `User ${id} not found`))

// ❌ Bad - generic error
return failure(Errors.internal('Not found'))
```

### 3. Handle All Cases in Controllers

```typescript
// ✅ Good - handles both cases
match(result, {
  onSuccess: (data) => res.status(200).json(data),
  onFailure: (error) => {
    const { status, body } = errorToResponse(error)
    res.status(status).json(body)
  },
})

// ❌ Bad - ignores failure case
if (isSuccess(result)) {
  res.json(result.value)
}
```

### 4. Use tryCatchAsync for External Calls

```typescript
// ✅ Good - wraps external call
const result = await tryCatchAsync(
  () => this.externalApi.call(data),
  (error) => Errors.internal('External API failed', error),
)

// ❌ Bad - lets exception propagate
const data = await this.externalApi.call(data) // May throw!
```

## File Structure

```text
src/shared/result/
├── index.ts      # Public exports
├── result.ts     # Result type and utility functions
└── errors.ts     # Error types and factory
```

## Migration Guide

### From try-catch to Result

**Before:**

```typescript
async execute(command: Command): Promise<Data> {
  try {
    const user = await this.repo.find(command.id)
    if (!user) {
      throw new Error('User not found')
    }
    return user
  } catch (error) {
    throw new Error('Failed to get user')
  }
}
```

**After:**

```typescript
async execute(command: Command): Promise<Result<Data, DomainError>> {
  const user = await this.repo.find(command.id)
  if (!user) {
    return failure(Errors.notFound('User'))
  }
  return success(user)
}
```

### Controller Migration

**Before:**

```typescript
async handle(req: Request, res: Response): Promise<void> {
  try {
    const result = await this.mediator.send(command)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
```

**After:**

```typescript
async handle(req: Request, res: Response): Promise<void> {
  const result = await this.mediator.send<Data, DomainError>(command)

  match(result, {
    onSuccess: (data) => res.json(data),
    onFailure: (error) => {
      const { status, body } = errorToResponse(error)
      res.status(status).json(body)
    },
  })
}
```
