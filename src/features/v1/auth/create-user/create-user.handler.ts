import { CreateUserCommand, CreateUserResult } from './create-user.command'

import { User, UserRepository } from '@/domain/user/user'
import { EmailService } from '@/infrastructure/messaging/interfaces/email-service'
import { CommandHandler } from '@/shared/cqs'
import { DomainError, Errors, failure, Result, success } from '@/shared/result'

/**
 * Handler for CreateUserCommand
 * Orchestrates user creation with domain logic and infrastructure
 */
export class CreateUserCommandHandler implements CommandHandler<CreateUserCommand, CreateUserResult, DomainError> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: CreateUserCommand): Promise<Result<CreateUserResult, DomainError>> {
    // Check if user already exists
    const existing = await this.userRepository.findByEmail(command.email)
    if (existing) {
      return failure(Errors.conflict('User', 'User with this email already exists'))
    }

    // Create domain entity
    const newUser = User.create(command.email, command.name || null)

    // Persist to repository
    const savedUser = await this.userRepository.save(newUser)

    // Send welcome email (integration)
    if (savedUser.name) {
      await this.emailService.sendWelcomeEmail(savedUser.email, savedUser.name)
    }

    return success({
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      createdAt: savedUser.createdAt,
    })
  }
}
