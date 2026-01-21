import { Request, Response } from 'express'

import { CreateUserCommand, CreateUserResult } from './create-user.command'

import { Mediator } from '@/shared/mediator'
import { ErrorResult, ErrorResultToHttpStatusCode } from '@/shared/result'

export type CreateUserDataRequest = {
  name: string
  email: string
}
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
    const command = CreateUserCommand.fromInput(req.body as CreateUserDataRequest)

    // Send command through mediator
    const result = await this.mediator.send<CreateUserResult>(command)

    // Handle Result using pattern matching
    result.match({
      ok: (data: CreateUserResult) => {
        res.redirect(`/v1/some-entity-uri/${data.id}`)
      },
      err: (error: ErrorResult) => {
        const statusCode = ErrorResultToHttpStatusCode.mapFrom(error)
        res.status(statusCode).json(error)
      },
    })
  }
}
