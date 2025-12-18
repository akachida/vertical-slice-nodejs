# Quick Start Guide

## Adding a New Feature in 3 Steps

### Step 1: Create Your Feature Module

Create `src/features/v1/[domain]/[feature-name]/index.ts`:

```typescript
import { Router } from 'express'
import { FeatureModule, InMemoryMediator, RouteConfig } from '@/shared/mediator'

export class YourFeatureModule implements FeatureModule {
  registerHandlers(mediator: InMemoryMediator): void {
    // 1. Initialize dependencies
    const repository = new YourRepository()

    // 2. Create handler
    const handler = new YourCommandHandler(repository)

    // 3. Register with mediator
    mediator.register(YourCommand.name, handler)
  }

  registerRoutes(mediator: InMemoryMediator): RouteConfig {
    // 1. Create router
    const router = Router()

    // 2. Create controller
    const controller = new YourController(mediator)

    // 3. Define routes
    router.post('/', (req, res) => controller.handle(req, res))

    // 4. Return configuration
    return {
      basePath: '/your-route',
      router,
    }
  }
}
```

### Step 2: Register in Startup

Add to `src/startup.ts`:

```typescript
import { YourFeatureModule } from '@/features/v1/domain/your-feature'

export const featureModules: FeatureModule[] = [
  new CreateUserModule(),
  new YourFeatureModule(), // <-- Add this line
]
```

### Step 3: Done

That's it! Your feature is now:

- ✅ Registered with the mediator
- ✅ Routes automatically mounted
- ✅ Ready to handle requests

## What Happens at Startup

```typescript
// In app.ts
Startup.initialize() // Registers all handlers
Startup.registerRoutes(app) // Mounts all routes
```

Behind the scenes:

1. **Handler Registration**: Each module's `registerHandlers()` is called
2. **Route Registration**: Each module's `registerRoutes()` is called
3. **Route Mounting**: Routes are automatically mounted at their base paths

## Example: Complete Feature

```text
src/features/v1/products/create-product/
├── index.ts                      # CreateProductModule
├── create-product.command.ts     # Command + validation
├── create-product.handler.ts     # Business logic
└── create-product.controller.ts  # HTTP handling
```

**index.ts**:

```typescript
export class CreateProductModule implements FeatureModule {
  registerHandlers(mediator: InMemoryMediator): void {
    const repo = new PrismaProductRepository()
    const handler = new CreateProductCommandHandler(repo)
    mediator.register(CreateProductCommand.name, handler)
  }

  registerRoutes(mediator: InMemoryMediator): RouteConfig {
    const router = Router()
    const controller = new CreateProductController(mediator)
    router.post('/', (req, res) => controller.handle(req, res))
    return { basePath: '/products', router }
  }
}
```

**startup.ts**:

```typescript
export const featureModules: FeatureModule[] = [
  new CreateUserModule(),
  new CreateProductModule(), // Just add this
]
```

**Result**: `POST /products` endpoint is now available!

## Testing Your Feature

```typescript
import { InMemoryMediator } from '@/shared/mediator'
import { YourFeatureModule } from './index'

describe('YourFeature', () => {
  it('registers handlers', async () => {
    const mediator = new InMemoryMediator()
    const module = new YourFeatureModule()

    module.registerHandlers(mediator)

    const result = await mediator.send(new YourCommand())
    expect(result).toBeDefined()
  })

  it('registers routes', () => {
    const mediator = new InMemoryMediator()
    const module = new YourFeatureModule()

    const config = module.registerRoutes(mediator)

    expect(config.basePath).toBe('/your-route')
    expect(config.router).toBeDefined()
  })
})
```

## Common Patterns

### Multiple Routes per Feature

```typescript
registerRoutes(mediator: InMemoryMediator): RouteConfig {
  const router = Router()
  const controller = new ProductController(mediator)

  router.get('/', (req, res) => controller.list(req, res))
  router.get('/:id', (req, res) => controller.get(req, res))
  router.post('/', (req, res) => controller.create(req, res))
  router.patch('/:id', (req, res) => controller.update(req, res))
  router.delete('/:id', (req, res) => controller.delete(req, res))

  return { basePath: '/products', router }
}
```

### Multiple Handlers per Feature

```typescript
registerHandlers(mediator: InMemoryMediator): void {
  const repo = new PrismaProductRepository()

  // Register multiple handlers
  mediator.register(CreateProductCommand.name, new CreateProductHandler(repo))
  mediator.register(UpdateProductCommand.name, new UpdateProductHandler(repo))
  mediator.register(DeleteProductCommand.name, new DeleteProductHandler(repo))
  mediator.register(GetProductQuery.name, new GetProductQueryHandler(repo))
}
```

### Shared Dependencies

```typescript
registerHandlers(mediator: InMemoryMediator): void {
  // Shared dependencies
  const repo = new PrismaProductRepository()
  const cache = new RedisCache()
  const logger = new Logger()

  // Use in multiple handlers
  const createHandler = new CreateProductHandler(repo, logger)
  const updateHandler = new UpdateProductHandler(repo, cache, logger)

  mediator.register(CreateProductCommand.name, createHandler)
  mediator.register(UpdateProductCommand.name, updateHandler)
}
```

## Tips

1. **Keep features focused** - One feature = one use case
2. **Use descriptive names** - `CreateUserModule`, not `UserModule`
3. **Follow REST conventions** - `/users`, `/products`, `/orders`
4. **Initialize dependencies once** - Create them in `registerHandlers()`
5. **Keep controllers thin** - Business logic goes in handlers

## Need Help?

- See [FEATURE_MODULES.md](./FEATURE_MODULES.md) for detailed architecture
- See [EXAMPLE_NEW_FEATURE.md](./EXAMPLE_NEW_FEATURE.md) for complete example
- See [ARCHITECTURE_SUMMARY.md](./ARCHITECTURE_SUMMARY.md) for overview
