import { CreateUserCommandHandler } from '@/features/v1/auth/create-user/create-user.handler'
import { CreateUserCommand } from '@/features/v1/auth/create-user/create-user.command'
import { User } from '@/domain/user/user'
import { EmailService } from '@/infrastructure/messaging/interfaces/email-service'
import { success } from '@/shared/result'

describe('CreateUserCommandHandler', () => {
  it('should create a new user', async () => {
    const userRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(User.create('test@test.com', 'Test User')),
    }
    const emailService: EmailService = {
      sendWelcomeEmail: jest.fn(),
    }
    const handler = new CreateUserCommandHandler(userRepository, emailService)
    const command = new CreateUserCommand('test@test.com', 'Test User')

    const result = await handler.execute(command)

    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@test.com')
    expect(userRepository.save).toHaveBeenCalled()
    expect(emailService.sendWelcomeEmail).toHaveBeenCalled()
    expect(result).toEqual(
      success({
        id: expect.any(String),
        email: 'test@test.com',
        name: 'Test User',
        createdAt: expect.any(Date),
      }),
    )
  })
})
