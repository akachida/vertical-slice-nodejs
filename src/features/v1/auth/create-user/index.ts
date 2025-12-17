import { Router } from 'express'

import { CreateUserCommand } from './create-user.command'
import { CreateUserController } from './create-user.controller'
import { CreateUserCommandHandler } from './create-user.handler'

import { ConsoleEmailService } from '@/infrastructure/messaging/email-service/console-email-service'
import { PrismaUserRepository } from '@/infrastructure/persistence/prisma/user-repository'
import { FeatureModule, InMemoryMediator, RouteConfig } from '@/shared/mediator'

/**
 * Create User Feature Module
 * Handles user creation command and route registration
 */
export class CreateUserModule implements FeatureModule {
  /**
   * Register command handlers with the mediator
   */
  registerHandlers(mediator: InMemoryMediator): void {
    // Infrastructure dependencies
    const userRepository = new PrismaUserRepository()
    const emailService = new ConsoleEmailService()

    // Register command handler
    const handler = new CreateUserCommandHandler(userRepository, emailService)
    mediator.register(CreateUserCommand.name, handler)
  }

  /**
   * Register routes for this feature
   */
  registerRoutes(mediator: InMemoryMediator): RouteConfig {
    const router = Router()
    const controller = new CreateUserController(mediator)

    // Define routes
    router.post('/', (req, res) => controller.handle(req, res))

    return {
      basePath: '/users',
      router,
    }
  }
}
