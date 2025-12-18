---
trigger: always_on
---

# Project Architecture & Guidelines

## 1. Overview

This project is built using **Node.js**, **Express**, and **TypeScript**.
We adhere to **Vertical Slice Architecture** to organize code by features rather than technical layers.
**Prisma** is used for database interactions and migrations.
We use a **Mediator** pattern to decouple features from each other.

## 2. Directory Structure

```text
src/
├── app.ts                # App entry point, middleware setup
├── server.ts             # Server startup
├── startup.ts            # Application startup configuration
├── shared/               # Shared utilities, middleware, and core infrastructure
│   ├── cqs/              # Command Query Separation interfaces
│   ├── db/               # Prisma client instance
│   ├── mediator/         # Mediator implementation
│   └── result/           # Result type for error handling
├── domain/               # Pure Domain Business Logic (Entities, Value Objects)
│   └── user/             # Domain definitions for User
├── infrastructure/       # External service adapters & Infrastructure
│   ├── persistence/      # Database/Storage implementations
│   │   └── prisma/       # e.g., Prisma implementation
│   └── messaging/        # Messaging/Queue implementations
│       └── email-service/
├── features/             # Vertical Slices (Application/Orchestration)
    └── v1/
        └── auth/             # Feature Group
            └── create-user/  # Specific Slice
                ├── index.ts              # Feature module definition
                ├── create-user.command.ts # Command definition
                ├── create-user.handler.ts # Command handler
                └── create-user.controller.ts # HTTP Handler (Controller)
```

## 3. Vertical Slice Architecture Rules

- **Separation of Concerns**: The `features` folder contains the application layer (slices). The `domain` folder encapsulates pure business logic, entities, and rules, completely decoupled from the HTTP layer or database details.
- **Slices**: Each feature in `features/` handles the orchestration (handling the request, calling the domain, using infrastructure).
- **Co-location**: Code specific to a slice stays in the slice.
- **Dependency Rule**:
  - `domain` is independent (no dependencies on features or infrastructure).
  - `features` depend on `domain`, `infrastructure`, and `shared`.
  - `infrastructure` depend on `shared` (and potentially `domain` types).
- **Mediator**: Features do not directly call each other. Instead, they use a mediator to send commands and queries. This decouples features from each other.

## 4. Prisma & Database

- The `schema.prisma` file defines the data model.
- We use a singleton Prisma Client instance exported from `src/shared/db`.
- Migrations are managed via `prisma migrate`.
- **Infrastructure**: Specific persistence logic can be placed in `src/infrastructure/persistence`.

## 5. External Infrastructure

- Infrastructure are categorized by type:
  - `src/infrastructure/persistence/{service-name}` (e.g., `redis`, `s3`)
  - `src/infrastructure/messaging/{service-name}` (e.g., `sqs`, `kafka`)
- **Pattern**:
  1. Define an **Interface** (Port) in `shared/infrastructure` (depending on scope).
  2. Create a **Concrete Implementation** (Adapter) in `infrastructure/`.
  3. Create a **Dummy/Mock Implementation** for local development.

## 6. Development Workflow

1. **New Feature**: Create a new folder in `src/features/v1/<domain>/<feature-name>`.
2. **Define Command/Query**: Create a new command or query in the feature's folder.
3. **Implement Handler**: Write the logic in `handler.ts`.
4. **Define Controller**: Create a controller to handle the HTTP request and send the command/query to the mediator.
5. **Define Feature Module**: Create a feature module to register the handler and routes.
6. **Database**: Update `schema.prisma` if needed and run migrations.
