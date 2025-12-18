# Feature Module Architecture

## Overview

The application uses a modular architecture where each feature is self-contained and automatically registers its command/query handlers with the mediator during startup.

## Architecture Components

### 1. FeatureModule Interface

Located in `src/shared/mediator/feature-module.ts`, this interface defines the contract for feature modules:

```typescript
export interface FeatureModule {
  registerHandlers(mediator: InMemoryMediator): void
  registerRoutes(mediator: InMemoryMediator): RouteConfig
}
```

### 2. Startup System

The `Startup` class in `src/shared/startup.ts` initializes the application, manages the mediator lifecycle, and automatically registers all routes from feature modules.

### 3. Composition Root

The `composition-root.ts` file collects all feature modules and registers them with the mediator.

## Creating a New Feature

### Step 1: Create Your Feature Structure

```text
src/features/v1/[domain]/[feature-name]/
├── index.ts                    # Feature module and router
├── [feature-name].command.ts   # Command/Query definition
├── [feature-name].handler.ts   # Command/Query handler
└── [feature-name].controller.ts # HTTP controller
```

### Step 2: Implement the FeatureModule

In your `index.ts`, create a class that implements `FeatureModule`:

```typescript
import { Router } from 'express'
import { FeatureModule, InMemoryMediator, RouteConfig } from '@/shared/mediator'
import { YourCommand } from './your-feature.command'
import { YourCommandHandler } from './your-feature.handler'
import { YourController } from './your-feature.controller'

export class YourFeatureModule implements FeatureModule {
  registerHandlers(mediator: InMemoryMediator): void {
    // Initialize dependencies
    const repository = new YourRepository()
    const service = new YourService()

    // Register handler
    const handler = new YourCommandHandler(repository, service)
    mediator.register(YourCommand.name, handler)
  }

  registerRoutes(mediator: InMemoryMediator): RouteConfig {
    const router = Router()
    const controller = new YourController(mediator)

    router.post('/', (req, res) => controller.handle(req, res))

    return {
      basePath: '/your-route',
      router,
    }
  }
}
```

### Step 3: Register in Composition Root

Add your module to `src/shared/composition-root.ts`:

```typescript
import { YourFeatureModule } from '@/features/v1/domain/your-feature'

export const featureModules: FeatureModule[] = [
  new CreateUserModule(),
  new YourFeatureModule(), // Add here
]
```

### Step 4: Done!

That's it! Your routes will be automatically registered when the application starts. No need to manually mount routers in `app.ts`.

## Benefits

### 1. **Modularity**

Each feature is self-contained with its own dependencies, handlers, and routes.

### 2. **Scalability**

Adding new features is straightforward - just implement the module and add it to the composition root.

### 3. **Testability**

Features can be tested in isolation by creating a mediator and registering only the required modules.

### 4. **Clear Separation of Concerns**

- Feature modules handle handler and route registration
- Composition root orchestrates modules
- Startup manages application lifecycle

### 5. **No Central Configuration**

The composition root doesn't need to know about handler dependencies or route paths - each feature manages its own.

### 6. **Automatic Route Registration**

Routes are automatically registered during startup - no manual mounting required in `app.ts`.

## Example: Testing a Feature Module

```typescript
import { InMemoryMediator } from '@/shared/mediator'
import { YourFeatureModule } from './index'
import { YourCommand } from './your-feature.command'

describe('YourFeatureModule', () => {
  it('should register handler correctly', async () => {
    const mediator = new InMemoryMediator()
    const module = new YourFeatureModule()

    module.registerHandlers(mediator)

    const command = new YourCommand('test-data')
    const result = await mediator.send(command)

    expect(result).toBeDefined()
  })

  it('should register routes correctly', () => {
    const mediator = new InMemoryMediator()
    const module = new YourFeatureModule()

    const routeConfig = module.registerRoutes(mediator)

    expect(routeConfig.basePath).toBe('/your-route')
    expect(routeConfig.router).toBeDefined()
  })
})
```

## Migration Guide

When migrating existing features:

1. Create a `FeatureModule` class in the feature's `index.ts`
2. Move dependency initialization from `composition-root.ts` to the module's `registerHandlers` method
3. Move handler registration from `composition-root.ts` to the module's `registerHandlers` method
4. Move route creation to the module's `registerRoutes` method
5. Update `composition-root.ts` to instantiate the new module in the `featureModules` array
6. Remove old imports, handler registration, and router factory from the feature's `index.ts`
7. Remove manual route mounting from `app.ts`

## Best Practices

1. **Keep modules focused** - One module per feature/use case
2. **Initialize dependencies in registerHandlers()** - Don't pass them through constructors
3. **Use descriptive module names** - `CreateUserModule`, `UpdateOrderModule`, etc.
4. **Define clear base paths** - Use RESTful conventions for route base paths
5. **Document dependencies** - Add comments for complex dependency graphs
6. **Keep routes simple** - Complex route logic should be in controllers, not in `registerRoutes()`
