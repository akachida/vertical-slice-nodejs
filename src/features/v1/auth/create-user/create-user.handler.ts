import { EmailAlreadyExistsError } from '@/features/v1/auth/create-user/errors/email-already-exists-error'
import { CreateUserCommand } from '@/features/v1/auth/create-user/create-user.command'
import { User } from '@/domain/user/user'
import { EmailService } from '@/infrastructure/messaging/interfaces/email-service'
import { CommandHandler } from '@/shared/cqs'
import { ErrorResult, Result } from '@/shared/result'
import { IUnitOfWork } from '@/shared/db/unit-of-work'

/**
 * Handler for CreateUserCommand
 * Uses Unit of Work with DbSet-like repository access (EF Core style)
 */
export class CreateUserCommandHandler implements CommandHandler<CreateUserCommand, CreateUserResult> {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: CreateUserCommand): Promise<Result<CreateUserResult, ErrorResult>> {
    const existing = await this.unitOfWork.users.findByEmail(command.email)

    if (existing) {
      return Result.err(EmailAlreadyExistsError.default())
    }

    const newUser = User.create(command.email, command.name)
    const savedUser = await this.unitOfWork.users.save(newUser)

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
