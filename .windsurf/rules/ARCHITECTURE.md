# Project Architecture & Guidelines

## 1. Overview

This project is built using **Node.js**, **Express**, and **TypeScript**.
We adhere to **Vertical Slice Architecture** to organize code by features rather than technical layers.
**Prisma** is used for database interactions and migrations.

## 2. Directory Structure

```
src/
├── app.ts                # App entry point, middleware setup
├── server.ts             # Server startup
├── config/               # Environment variables and configuration
├── shared/               # Shared utilities, middleware, and core infrastructure
│   ├── db/               # Prisma client instance
│   ├── errors/           # Custom error classes
│   └── middleware/       # Common middleware (error handling, auth, etc.)
├── domain/               # Pure Domain Business Logic (Entities, Value Objects)
│   ├── user/             # Domain definitions for User
│   └── invoice/          # Domain definitions for Invoice
├── infrastructure/       # External service adapters & Infrastructure
│   ├── persistence/      # Database/Storage implementations
│   │   └── prisma/       # e.g., Prisma implementation
│   ├── messaging/        # Messaging/Queue implementations
│   │   └── rabbitmq/
│   └── external-api/     # Other 3rd party APIs
├── features/             # Vertical Slices (Application/Orchestration)
    ├── auth/             # Feature Group
    │   ├── login/        # Specific Slice
    │   │   ├── index.ts  # Route definition
    │   │   ├── handler.ts# HTTP Handler (Controller)
    │   │   └── use-case.ts# Application Logic (Orchestrates Domain & Infrastructure)
    │   └── register/
    └── invoicing/
```

## 3. Vertical Slice Architecture Rules

- **Separation of Concerns**: The `features` folder contains the application layer (slices). The `domain` folder encapsulates pure business logic, entities, and rules, completely decoupled from the HTTP layer or database details.
- **Slices**: Each feature in `features/` handles the orchestration (handling the request, calling the domain, using infrastructure).
- **Co-location**: Code specific to a slice stays in the slice.
- **Dependency Rule**:
  - `domain` is independent (no dependencies on features or infrastructure).
  - `features` depend on `domain`, `infrastructure`, and `shared`.
  - `infrastructure` depend on `shared` (and potentially `domain` types).

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
  1.  Define an **Interface** (Port) in `domain` or `shared` (depending on scope).
  2.  Create a **Concrete Implementation** (Adapter) in `infrastructure/`.
  3.  Create a **Dummy/Mock Implementation** for local development.

## 6. Development Workflow

1.  **New Feature**: Create a new folder in `src/features/<domain>/<feature-name>`.
2.  **Define Route**: Add the route in the feature's `index.ts` and mount it in the main app router.
3.  **Implement**: Write the logic in `handler.ts`.
4.  **Database**: Update `schema.prisma` if needed and run migrations.
