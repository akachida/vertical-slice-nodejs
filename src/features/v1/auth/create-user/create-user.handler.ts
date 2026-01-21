import { EmailAlreadyExistsError } from '@/features/v1/auth/create-user/errors/EmailAlreadyExistsError'
import { CreateUserCommand, CreateUserResult } from '@/features/v1/auth/create-user/create-user.command'
import { User, UserRepository } from '@/domain/user/user'
import { EmailService } from '@/infrastructure/messaging/interfaces/email-service'
import { CommandHandler } from '@/shared/cqs'
import { ErrorResult, Result } from '@/shared/result'

/**
 * Handler for CreateUserCommand
 * Orchestrates user creation with domain logic and infrastructure
 */
export class CreateUserCommandHandler implements CommandHandler<CreateUserCommand, CreateUserResult> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: CreateUserCommand): Promise<Result<CreateUserResult, ErrorResult>> {
    // Check if user already exists
    const existing = await this.userRepository.findByEmail(command.email)
    if (existing) {
      return Result.err(EmailAlreadyExistsError.default())
    }

    // Create domain entity
    const newUser = User.create(command.email, command.name)

    // Persist to repository
    const savedUser = await this.userRepository.save(newUser)

    // Send welcome email (integration)
    if (savedUser.name) {
      await this.emailService.sendWelcomeEmail(savedUser.email, savedUser.name)
    }

    return Result.ok({
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      createdAt: savedUser.createdAt,
    })
  }
}
