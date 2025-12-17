import { z } from 'zod'

import { Command } from '@/shared/cqs'

/**
 * Validation schema for CreateUser command
 */
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

/**
 * Command to create a new user
 */
export class CreateUserCommand implements Command {
  readonly _tag = 'Command' as const

  constructor(
    public readonly email: string,
    public readonly name?: string,
  ) {}

  /**
   * Factory method with validation
   */
  static fromInput(input: unknown): CreateUserCommand {
    const validated = createUserSchema.parse(input)
    return new CreateUserCommand(validated.email, validated.name)
  }
}

/**
 * Result type for CreateUser command
 */
export interface CreateUserResult {
  id: string
  email: string
  name: string | null
  createdAt: Date
}
