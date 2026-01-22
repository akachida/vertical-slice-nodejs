import { CreateUserCommandHandler } from '@/features/v1/auth/create-user/create-user.handler'
import { CreateUserCommand } from '@/features/v1/auth/create-user/create-user.command'
import { User } from '@/domain/user/user'
import { EmailService } from '@/infrastructure/messaging/interfaces/email-service'
import { IUnitOfWork } from '@/shared/db/unit-of-work'
import { EmailAlreadyExistsError } from '@/features/v1/auth/create-user/errors/email-already-exists-error'
import { Prisma } from '@/shared/db/generated/client/client'

describe('CreateUserCommandHandler', () => {
  let mockUserRepository: { findByEmail: jest.Mock; save: jest.Mock }
  let mockUnitOfWork: IUnitOfWork
  let emailService: EmailService
  let handler: CreateUserCommandHandler

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn().mockResolvedValue(User.create('test@test.com', 'Test User')),
    }
    mockUnitOfWork = {
      users: mockUserRepository,
      getTransaction: jest.fn(),
      executeInTransaction: jest.fn(async (work) => work()),
      addPostCommitHook: jest.fn(),
    }
    emailService = {
      sendWelcomeEmail: jest.fn(),
    }
    handler = new CreateUserCommandHandler(mockUnitOfWork, emailService)
  })

  it('should create a new user and queue a welcome email', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null)
    const command = new CreateUserCommand('test@test.com', 'Test User')

    const result = await handler.execute(command)

    expect(mockUnitOfWork.users.findByEmail).toHaveBeenCalledWith('test@test.com')
    expect(mockUnitOfWork.users.save).toHaveBeenCalled()
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toEqual({
      id: expect.any(String),
      email: 'test@test.com',
      name: 'Test User',
      createdAt: expect.any(Date),
    })

    // Check that the email hook was added but not yet called
    expect(mockUnitOfWork.addPostCommitHook).toHaveBeenCalledTimes(1)
    expect(emailService.sendWelcomeEmail).not.toHaveBeenCalled()

    // Manually execute the hook to simulate post-commit behavior
    const hook = (mockUnitOfWork.addPostCommitHook as jest.Mock).mock.calls[0][0]
    await hook()

    expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith('test@test.com', 'Test User')
  })

  it('should return an error when email already exists on initial check', async () => {
    const existingUser = User.create('exists@test.com', 'Existing User')
    mockUserRepository.findByEmail.mockResolvedValue(existingUser)
    const command = new CreateUserCommand('exists@test.com', 'New User')

    const result = await handler.execute(command)

    expect(mockUnitOfWork.users.findByEmail).toHaveBeenCalledWith('exists@test.com')
    expect(mockUnitOfWork.users.save).not.toHaveBeenCalled()
    expect(emailService.sendWelcomeEmail).not.toHaveBeenCalled()
    expect(mockUnitOfWork.addPostCommitHook).not.toHaveBeenCalled()
    expect(result.isErr()).toBe(true)
    expect(result.unwrapErr()).toBeInstanceOf(EmailAlreadyExistsError)
  })

  it('should handle race condition and return an error if email is created concurrently', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null)
    const p2002Error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
      meta: { target: ['email'] },
    })
    mockUserRepository.save.mockRejectedValue(p2002Error)
    const command = new CreateUserCommand('race@test.com', 'Race Condition User')

    const result = await handler.execute(command)

    expect(mockUnitOfWork.users.findByEmail).toHaveBeenCalledWith('race@test.com')
    expect(mockUnitOfWork.users.save).toHaveBeenCalled()
    expect(emailService.sendWelcomeEmail).not.toHaveBeenCalled()
    expect(mockUnitOfWork.addPostCommitHook).not.toHaveBeenCalled()
    expect(result.isErr()).toBe(true)
    expect(result.unwrapErr()).toBeInstanceOf(EmailAlreadyExistsError)
  })
})
