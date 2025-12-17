import { Application } from 'express'

import { FeatureModule, InMemoryMediator, RouteConfig } from '@/shared/mediator'
import { CreateUserModule } from '@/features/v1/auth/create-user'

/**
 * All feature modules in the application
 */
export const featureModules: FeatureModule[] = [new CreateUserModule()]

/**
 * Composition Root
 * Responsible for bootstrapping the mediator with all feature modules
 */
export function createMediator(): InMemoryMediator {
  const mediator = new InMemoryMediator()

  featureModules.forEach((module) => module.registerHandlers(mediator))

  return mediator
}

/**
 * Application startup configuration
 * Initializes all core services and feature modules
 */
export class Startup {
  private static mediatorInstance: InMemoryMediator | null = null

  /**
   * Initialize the application
   * Sets up the mediator with all registered feature modules
   */
  static initialize(): InMemoryMediator {
    if (!this.mediatorInstance) {
      this.mediatorInstance = createMediator()
    }

    return this.mediatorInstance
  }

  /**
   * Register all routes from feature modules
   * @param app - Express application instance
   */
  static registerRoutes(app: Application): void {
    const mediator = this.getMediator()

    const routes: RouteConfig[] = featureModules.map((module) => module.registerRoutes(mediator))

    routes.forEach((route) => {
      app.use(route.basePath, route.router)
    })
  }

  /**
   * Get the mediator instance
   * Throws if not initialized
   */
  static getMediator(): InMemoryMediator {
    if (!this.mediatorInstance) {
      throw new Error('Application not initialized. Call Startup.initialize() first.')
    }

    return this.mediatorInstance
  }

  /**
   * Reset the application state (useful for testing)
   */
  static reset(): void {
    this.mediatorInstance = null
  }
}
