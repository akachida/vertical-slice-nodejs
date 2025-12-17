import { Router } from 'express'

import { Handler, InMemoryMediator } from './mediator'

/**
 * Handler registration entry
 */
export interface HandlerRegistration {
  requestName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: Handler<any, any>
}

/**
 * Route configuration for a feature
 */
export interface RouteConfig {
  /**
   * Base path for the routes (e.g., '/users', '/orders')
   */
  basePath: string
  /**
   * Router instance with all routes configured
   */
  router: Router
}

/**
 * Feature module interface
 * Each feature implements this to register its handlers and routes
 */
export interface FeatureModule {
  /**
   * Register all handlers for this feature
   * @param mediator - Mediator instance to register handlers with
   */
  registerHandlers(mediator: InMemoryMediator): void

  /**
   * Register all routes for this feature
   * @param mediator - Mediator instance to inject into controllers
   * @returns Route configuration with base path and router
   */
  registerRoutes(mediator: InMemoryMediator): RouteConfig
}
