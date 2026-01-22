import { Router } from 'express'

import { CreateUserCommand } from './create-user.command'
import { CreateUserController } from './create-user.controller'
import { CreateUserCommandHandler } from './create-user.handler'

import { ConsoleEmailService } from '@/infrastructure/messaging/email-service/console-email-service'
import { FeatureModule, InMemoryMediator, RouteConfig } from '@/shared/mediator'
import { IUnitOfWorkFactory } from '@/shared/db/unit-of-work'

/**
 * Create User Feature Module
 * Handles user creation command and route registration
 */
export class CreateUserModule implements FeatureModule {
  constructor(private readonly unitOfWorkFactory: IUnitOfWorkFactory) {}

  registerHandlers(mediator: InMemoryMediator): void {
    const emailService = new ConsoleEmailService()

    mediator.registerFactory(CreateUserCommand.name, () => {
      const unitOfWork = this.unitOfWorkFactory.create()
      return new CreateUserCommandHandler(unitOfWork, emailService)
    })
  }

  registerRoutes(mediator: InMemoryMediator): RouteConfig {
    const router = Router()
    const controller = new CreateUserController(mediator)
    router.post('/', (req, res, next) => controller.handle(req, res, next))

    return {
      basePath: '/users',
      router,
    }
  }
}
