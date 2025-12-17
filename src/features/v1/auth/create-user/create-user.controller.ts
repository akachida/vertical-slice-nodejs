import { Request, Response } from 'express'

import { CreateUserCommand, CreateUserResult } from './create-user.command'

import { Mediator } from '@/shared/mediator'
import { DomainError, errorToResponse, match } from '@/shared/result'

/**
 * Controller for user creation endpoint
 * Handles HTTP request/response and delegates to Mediator
 */
export class CreateUserController {
  constructor(private readonly mediator: Mediator) {}

  /**
   * Handle POST /users request
   */
  async handle(req: Request, res: Response): Promise<void> {
    // Validate and create command from request body
    const command = CreateUserCommand.fromInput(req.body)

    // Send command through mediator
    const result = await this.mediator.send<CreateUserResult, DomainError>(command)

    // Handle Result using pattern matching
    match(result, {
      onSuccess: (data) => {
        res.status(201).json(data)
      },
      onFailure: (error) => {
        const { status, body } = errorToResponse(error)
        res.status(status).json(body)
      },
    })
  }
}
