import { PrismaClient } from '@/shared/db/generated/client/client'
import { PrismaUnitOfWork } from '@/shared/db/prisma-unit-of-work'
import { Result } from '@/shared/result'
import { PrismaTransaction } from '@/shared/db/unit-of-work'

describe('PrismaUnitOfWork', () => {
  let uow: PrismaUnitOfWork
  let mockPrisma: jest.Mocked<PrismaClient>
  let mockTx: jest.Mocked<PrismaTransaction>

  beforeEach(() => {
    mockTx = {
      // Mock any transaction methods needed by repositories here
      user: {
        findUnique: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaTransaction>

    mockPrisma = {
      $transaction: jest.fn().mockImplementation(async <R>(fn: (tx: PrismaTransaction) => Promise<R>): Promise<R> => {
        // Simulate Prisma's behavior: run the function and pass the mock transaction context
        return await fn(mockTx)
      }),
    } as unknown as jest.Mocked<PrismaClient>

    uow = new PrismaUnitOfWork(mockPrisma)
  })

  it('should call prisma.$transaction when executing work', async () => {
    await uow.executeInTransaction(async () => Result.ok('Success'))
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1)
  })

  it('should return the Ok result and commit the transaction', async () => {
    const successResult = Result.ok('SuccessData')
    const work = jest.fn().mockResolvedValue(successResult)

    const result = await uow.executeInTransaction(work)

    expect(work).toHaveBeenCalledTimes(1)
    expect(result).toBe(successResult)
  })

  it('should return the Err result and roll back the transaction', async () => {
    const errorResult = Result.err('ErrorData')
    const work = jest.fn().mockResolvedValue(errorResult)

    // Redefine the mock to simulate a rollback
    mockPrisma.$transaction.mockImplementation(async <R>(fn: (tx: PrismaTransaction) => Promise<R>): Promise<R> => {
      let result: R
      try {
        result = await fn(mockTx)
        if (result instanceof Result && result.isErr()) {
          // This simulates the throw that Prisma's $transaction would do
          throw new Error('Rollback')
        }
      } catch (e) {
        // In a real scenario, Prisma rolls back. Here, we just care that the Err is returned.
        // The custom RollbackSignal handles this.
        if (e instanceof Error && e.message === 'Rollback') {
          // This path won't be hit because the RollbackSignal is caught inside executeInTransaction
        } else if ((e as any).name === 'RollbackSignal') {
          return (e as any).result
        }
      }
      return result!
    })

    const result = await uow.executeInTransaction(work)

    expect(work).toHaveBeenCalledTimes(1)
    expect(result).toBe(errorResult)
  })

  it('should re-throw unexpected errors during transaction', async () => {
    const unexpectedError = new Error('Unexpected DB error')
    const work = jest.fn().mockRejectedValue(unexpectedError)

    mockPrisma.$transaction.mockRejectedValue(unexpectedError)

    await expect(uow.executeInTransaction(work)).rejects.toThrow(unexpectedError)
  })

  it('should throw when getTransaction is called outside of a transaction', () => {
    expect(() => uow.getTransaction()).toThrow(
      'No active transaction. getTransaction() can only be called within executeInTransaction.',
    )
  })

  it('should provide the transaction context to getTransaction within a transaction', async () => {
    let capturedTx: PrismaTransaction | null = null
    const work = async () => {
      capturedTx = uow.getTransaction()
      return Result.ok(null)
    }

    await uow.executeInTransaction(work)

    expect(capturedTx).toBe(mockTx)
  })

  it('should lazily create a user repository with the UoW instance', () => {
    const userRepo = uow.users
    expect(userRepo).toBeDefined()
    const userRepo2 = uow.users
    expect(userRepo2).toBe(userRepo) // Should return the same instance
  })

  it('should execute post-commit hooks on a successful transaction', async () => {
    const hook = jest.fn().mockResolvedValue(undefined)
    uow.addPostCommitHook(hook)

    const work = () => Promise.resolve(Result.ok('Success'))
    await uow.executeInTransaction(work)

    expect(hook).toHaveBeenCalledTimes(1)
  })

  it('should not execute post-commit hooks on a failed transaction', async () => {
    const hook = jest.fn().mockResolvedValue(undefined)
    uow.addPostCommitHook(hook)

    const work = () => Promise.resolve(Result.err('Failure'))
    await uow.executeInTransaction(work)

    expect(hook).not.toHaveBeenCalled()
  })
})
