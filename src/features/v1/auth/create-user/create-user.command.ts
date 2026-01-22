import { z } from 'zod'

import { Command } from '@/shared/cqs'
import { CreateUserDataRequest } from '@/features/v1/auth/create-user/create-user.controller'

/**
 * Zod validation schema for CreateUser command input.
 * Ensures email format is valid and name is provided.
 */
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
})

/**
 * Command to create a new user in the system.
 * Encapsulates the user creation request data.
 * Marked as transactional - mediator will automatically wrap in Unit of Work.
 */
export class CreateUserCommand implements Command {
  readonly _tag = 'Command' as const
  readonly transactional = true

  constructor(
    public readonly email: string,
    public readonly name: string,
  ) {}

  /**
   * Creates a CreateUserCommand from raw input with validation.
   * @param input - Raw request data from HTTP request
   * @throws ZodError if validation fails
   */
  static fromInput(input: CreateUserDataRequest): CreateUserCommand {
    const validated = createUserSchema.parse(input)
    return new CreateUserCommand(validated.email, validated.name)
  }
}
