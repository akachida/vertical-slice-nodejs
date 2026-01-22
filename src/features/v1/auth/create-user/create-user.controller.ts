import { Request, Response } from 'express'

import { CreateUserCommand } from '@/features/v1/auth/create-user/create-user.command'
import { Mediator } from '@/shared/mediator'
import { ErrorResult, ErrorResultToHttpStatusCode } from '@/shared/result'
import { CreateUserResult } from '@/features/v1/auth/create-user/create-user.handler'

/**
 * Request payload type for user creation.
 */
export type CreateUserDataRequest = {
  name: string
  email: string
}

/**
 * Controller for user creation endpoint.
 * Handles HTTP request/response and delegates business logic to the mediator.
 */
export class CreateUserController {
  constructor(private readonly mediator: Mediator) {}

  /**
   * Handles POST /users request to create a new user.
   * @param req - Express request object
   * @param res - Express response object
   */
  async handle(req: Request, res: Response): Promise<void> {
    const command = CreateUserCommand.fromInput(req.body as CreateUserDataRequest)
    const result = await this.mediator.send<CreateUserResult>(command)

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
