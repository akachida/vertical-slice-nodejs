import { InMemoryMediator } from '@/shared/mediator/mediator'
import { Command, CommandHandler } from '@/shared/cqs'
import { ErrorResult, Result } from '@/shared/result'
import { IUnitOfWork, IUnitOfWorkFactory } from '@/shared/db/unit-of-work'

// 1. Mock Command
class TestTransactionalCommand extends Command {
  transactional = true
  constructor(public readonly shouldSucceed: boolean) {
    super()
  }
}

// 2. Mock Handler
class TestCommandHandler implements CommandHandler<TestTransactionalCommand, string, string> {
  constructor(public readonly uow: IUnitOfWork) {}

  async execute(command: TestTransactionalCommand): Promise<Result<string, string>> {
    if (command.shouldSucceed) {
      return Result.ok('Success')
    }
    return Result.err('Failure')
  }
}

describe('InMemoryMediator', () => {
  let mediator: InMemoryMediator
  let mockUow: IUnitOfWork
  let mockUowFactory: IUnitOfWorkFactory
  let handlerFactory: jest.Mock

  beforeEach(() => {
    mediator = new InMemoryMediator()

    // 3. Mock UoW and Factory
    mockUow = {
      users: {} as any, // Not needed for this test
      getTransaction: jest.fn(),
      executeInTransaction: jest.fn(async (work) => {
        // Directly execute the work function to simulate commit/rollback behavior
        return work()
      }),
      addPostCommitHook: jest.fn(),
    }

    mockUowFactory = {
      create: jest.fn().mockReturnValue(mockUow),
    }

    mediator.setUnitOfWorkFactory(mockUowFactory)

    // 4. Mock Handler Factory
    handlerFactory = jest.fn((uow) => new TestCommandHandler(uow))
    mediator.registerFactory(TestTransactionalCommand.name, handlerFactory)
  })

  it('should create a UoW and pass it to the handler for a transactional command', async () => {
    const command = new TestTransactionalCommand(true)

    await mediator.send(command)

    // UoW factory was called to create a UoW instance
    expect(mockUowFactory.create).toHaveBeenCalledTimes(1)

    // Handler factory was called with the created UoW instance
    expect(handlerFactory).toHaveBeenCalledTimes(1)
    expect(handlerFactory).toHaveBeenCalledWith(mockUow)
  })

  it('should execute the handler within a transaction for a transactional command', async () => {
    const command = new TestTransactionalCommand(true)
    const handler = new TestCommandHandler(mockUow)
    const executeSpy = jest.spyOn(handler, 'execute')
    handlerFactory.mockReturnValue(handler) // Return a specific instance to spy on

    await mediator.send(command)

    // The UoW's transaction method was called
    expect(mockUow.executeInTransaction).toHaveBeenCalledTimes(1)

    // The handler's execute method was called inside the transaction
    expect(executeSpy).toHaveBeenCalledWith(command)
  })

  it('should not create a transaction for a non-transactional command', async () => {
    class NonTransactionalCommand extends Command {}
    class NonTransactionalHandler implements CommandHandler<NonTransactionalCommand, string, ErrorResult> {
      execute = jest.fn().mockResolvedValue(Result.ok('Success'))
    }
    const handler = new NonTransactionalHandler()
    mediator.register(NonTransactionalCommand.name, handler)

    await mediator.send(new NonTransactionalCommand())

    expect(mockUowFactory.create).not.toHaveBeenCalled()
    expect(mockUow.executeInTransaction).not.toHaveBeenCalled()
    expect(handler.execute).toHaveBeenCalledTimes(1)
  })

  it('should throw if a transactional command is sent without a registered factory', async () => {
    const otherMediator = new InMemoryMediator()
    otherMediator.setUnitOfWorkFactory(mockUowFactory)
    const command = new TestTransactionalCommand(true)
    // No factory registered for TestTransactionalCommand

    await expect(otherMediator.send(command)).rejects.toThrow(
      'No handler factory registered for transactional command TestTransactionalCommand. Use registerFactory.',
    )
  })
})
