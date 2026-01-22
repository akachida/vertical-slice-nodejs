import { PrismaClient } from '@/shared/db/generated/client/client'
import { Result } from '@/shared/result'
import { UserRepository } from '@/domain/user/user'

/**
 * Prisma transaction type
 * This is the type that repositories will use to execute queries within a transaction
 */
export type PrismaTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

/**
 * Unit of Work interface for managing database transactions
 * Works seamlessly with the Result pattern - automatically commits on Ok, rolls back on Err
 * Provides DbSet-like repository access similar to EF Core's DbContext
 */
export interface IUnitOfWork {
  /**
   * Gets the current transaction context
   * Repositories use this to participate in the same transaction
   */
  getTransaction(): PrismaTransaction

  /**
   * Executes work within a transaction
   * Automatically commits on Result.ok() and rolls back on Result.err()
   *
   * @param work - Function that returns a Result
   * @returns The result from the work function
   */
  executeInTransaction<TResult, TError>(work: () => Promise<Result<TResult, TError>>): Promise<Result<TResult, TError>>

  /**
   * DbSet-like repository accessors
   * Similar to EF Core's context.Users, context.Orders, etc.
   */
  readonly users: UserRepository
}

/**
 * Factory for creating Unit of Work instances
 * Each request should get a fresh Unit of Work instance
 */
export interface IUnitOfWorkFactory {
  create(): IUnitOfWork
}
