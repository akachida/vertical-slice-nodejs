import { EmailAlreadyExistsError } from '@/features/v1/auth/create-user/errors/email-already-exists-error'
import { CreateUserCommand } from '@/features/v1/auth/create-user/create-user.command'
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
    const existing = await this.userRepository.findByEmail(command.email)
    if (existing) {
      return Result.err(EmailAlreadyExistsError.default())
    }

    const newUser = User.create(command.email, command.name)
    const savedUser = await this.userRepository.save(newUser)

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

/**
 * Result type returned after successful user creation.
 * Contains the created user's essential information.
 */
export type CreateUserResult = {
  id: string
  email: string
  name: string | null
  createdAt: Date
}
