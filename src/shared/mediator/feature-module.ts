import { Router } from 'express'

import { Handler, InMemoryMediator } from './mediator'

/**
 * Represents a handler registration entry.
 * Used internally for tracking handler registrations.
 */
export interface HandlerRegistration {
  requestName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: Handler<any, any>
}

/**
 * Configuration for feature routes.
 * Defines the base path and Express router for a feature module.
 */
export interface RouteConfig {
  /**
   * Base path for the routes (e.g., '/users', '/orders', '/products').
   */
  basePath: string
  /**
   * Express router instance with all routes configured for this feature.
   */
  router: Router
}

/**
 * Feature module interface following the Vertical Slice Architecture pattern.
 * Each feature implements this interface to self-register its handlers and routes.
 * This enables modular, self-contained features that can be easily added or removed.
 */
export interface FeatureModule {
  /**
   * Registers all command and query handlers for this feature with the mediator.
   * This is where feature dependencies are initialized and handlers are created.
   * @param mediator - Mediator instance to register handlers with
   */
  registerHandlers(mediator: InMemoryMediator): void

  /**
   * Registers all HTTP routes for this feature.
   * Creates controllers and defines route mappings.
   * @param mediator - Mediator instance to inject into controllers
   * @returns Route configuration with base path and configured router
   */
  registerRoutes(mediator: InMemoryMediator): RouteConfig
}
