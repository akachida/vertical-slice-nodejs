import { PrismaClient } from '@/shared/db/generated/client/client'
import { Result } from '@/shared/result'
import { IUnitOfWork, IUnitOfWorkFactory, PrismaTransaction } from '@/shared/db/unit-of-work'
import { UserRepository } from '@/domain/user/user'
import { PrismaUserRepository } from '@/infrastructure/persistence/prisma/user-repository'

/**
 * Internal error to signal rollback while preserving the original Result
 * This allows us to distinguish between business errors (Result.err) and unexpected exceptions
 */
class RollbackSignal extends Error {
  constructor(public readonly result: Result<unknown, unknown>) {
    super('Rollback signal')
    this.name = 'RollbackSignal'
  }
}

/**
 * Prisma implementation of Unit of Work
 * Automatically handles commit/rollback based on Result pattern:
 * - Result.ok() -> Transaction commits
 * - Result.err() -> Transaction rolls back
 * Provides DbSet-like repository access
 */
export class PrismaUnitOfWork implements IUnitOfWork {
  private transactionContext: PrismaTransaction | null = null
  private _users: UserRepository | null = null
  private postCommitHooks: (() => Promise<void>)[] = []

  constructor(private readonly prisma: PrismaClient) {}

  addPostCommitHook(hook: () => Promise<void>): void {
    this.postCommitHooks.push(hook)
  }

  /**
   * DbSet-like accessor for Users repository
   * Lazily initialized when first accessed
   * Similar to EF Core's context.Users
   */
  get users(): UserRepository {
    if (!this._users) {
      this._users = new PrismaUserRepository(this)
    }
    return this._users
  }

  getTransaction(): PrismaTransaction {
    if (!this.transactionContext) {
      throw new Error('No active transaction. getTransaction() can only be called within executeInTransaction.')
    }
    return this.transactionContext
  }

  async executeInTransaction<TResult, TError>(
    work: () => Promise<Result<TResult, TError>>,
  ): Promise<Result<TResult, TError>> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        this.transactionContext = tx as PrismaTransaction

        const workResult = await work()

        if (workResult.isErr()) {
          throw new RollbackSignal(workResult)
        }

        return workResult
      })

      if (result.isOk()) {
        for (const hook of this.postCommitHooks) {
          await hook()
        }
      }

      return result
    } catch (error) {
      if (error instanceof RollbackSignal) {
        return error.result as Result<TResult, TError>
      }

      // Unexpected error - this shouldn't happen with proper Result usage
      // Re-throw to be handled by global error handler
      throw error
    } finally {
      this.transactionContext = null
      this._users = null
      this.postCommitHooks = []
    }
  }
}

/**
 * Factory for creating PrismaUnitOfWork instances
 * Each request should get a fresh Unit of Work instance
 */
export class PrismaUnitOfWorkFactory implements IUnitOfWorkFactory {
  constructor(private readonly prisma: PrismaClient) {}

  create(): IUnitOfWork {
    return new PrismaUnitOfWork(this.prisma)
  }
}
