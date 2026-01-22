import { Router } from 'express'

import { CreateUserCommand } from './create-user.command'
import { CreateUserController } from './create-user.controller'
import { CreateUserCommandHandler } from './create-user.handler'

import { ConsoleEmailService } from '@/infrastructure/messaging/email-service/console-email-service'
import { FeatureModule, InMemoryMediator, RouteConfig } from '@/shared/mediator'

/**
 * Create User Feature Module
 * Handles user creation command and route registration
 */
export class CreateUserModule implements FeatureModule {
  registerHandlers(mediator: InMemoryMediator): void {
    const emailService = new ConsoleEmailService()

    mediator.registerFactory(CreateUserCommand.name, (unitOfWork) => {
      if (!unitOfWork) {
        throw new Error('Unit of work is not available for this handler')
      }

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
