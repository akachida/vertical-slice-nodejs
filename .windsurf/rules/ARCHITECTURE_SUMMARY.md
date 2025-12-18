# Architecture Summary

## Overview

The application uses a **Feature Module** architecture where each feature is completely self-contained and automatically registers both its handlers and routes during application startup.

## Key Files

### Feature Module (`src/features/v1/[domain]/[feature]/index.ts`)

Each feature exports a module class that implements `FeatureModule`:

```typescript
export class YourFeatureModule implements FeatureModule {
  // Register command/query handlers
  registerHandlers(mediator: InMemoryMediator): void {}

  // Register HTTP routes
  registerRoutes(mediator: InMemoryMediator): RouteConfig {}
}
```

### Startup (`src/startup.ts`)

Central registry of all feature modules:

```typescript
export const featureModules: FeatureModule[] = [
  new CreateUserModule(),
  new UpdateUserModule(),
  // Add new modules here
]
```

### Application Entry (`src/app.ts`)

Minimal setup - just calls startup methods:

```typescript
const app = express()
app.use(express.json())

Startup.initialize()
Startup.registerRoutes(app)

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})
```

## Adding a New Feature

1. **Create feature directory** with command, handler, controller, and index.ts
2. **Implement FeatureModule** in index.ts with `registerHandlers` and `registerRoutes`
3. **Add to composition-root** in the `featureModules` array
4. **Done!** - No changes needed to app.ts

## Benefits

- **Zero boilerplate** in app.ts
- **Self-documenting** - all feature modules listed in one place
- **Testable** - features can be tested in isolation
- **Scalable** - adding features is just adding to an array
- **Type-safe** - TypeScript enforces the FeatureModule interface

## Flow

```text
app.ts
  └─> Startup.initialize()
       └─> createMediator()
            └─> featureModules.forEach(m => m.registerHandlers(mediator))

  └─> Startup.registerRoutes(app)
       └─> featureModules.forEach(m => {
            const config = m.registerRoutes(mediator)
            app.use(config.basePath, config.router)
          })
```

## Example Feature Structure

```text
src/features/v1/auth/create-user/
├── index.ts                    # CreateUserModule (FeatureModule implementation)
├── create-user.command.ts      # Command definition
├── create-user.handler.ts      # Command handler
└── create-user.controller.ts   # HTTP controller
```

## Testing

```typescript
// Test handlers
const mediator = new InMemoryMediator()
const module = new YourFeatureModule()
module.registerHandlers(mediator)

const result = await mediator.send(new YourCommand())

// Test routes
const routeConfig = module.registerRoutes(mediator)
expect(routeConfig.basePath).toBe('/your-route')
```
