# Vertical Slice Architecture for Node.js

Welcome to the **Vertical Slice Architecture for Node.js** project! This repository serves as a template and starting point for building scalable Node.js services using **Vertical Slice Architecture**, **TypeScript**, and **Prisma**.

It is designed to be modular, testable, and easy to maintain, with a strong focus on separating business domain logic from infrastructure and application details.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Prisma ORM (v7+) with SQLite (default for dev)
- **Package Manager**: PNPM

## 🏗️ Architecture

We follow **Vertical Slice Architecture** to organize code by **features** rather than technical layers (controllers, services, models).

### Directory Structure

```text
src/
├── config/               # Environment variables
├── domain/               # Pure Business Logic (Entities, Value Objects)
│   └── user/             # User Domain
├── features/             # Vertical Slices (Application/Orchestration)
│   └── auth/
│       └── create-user/  # Feature Slice: Handler, UseCase, Validation
├── infrastructure/       # External Adapters (Infrastructure)
│   ├── persistence/      # Repositories (Prisma, In-Memory)
│   └── messaging/        # Email/Queue Services
└── shared/               # Shared Utilities & Middleware
    └── db/               # Prisma Client Singleton
```

### Key Concepts

1. **Vertical Slices**: Each feature (e.g., `create-user`) is self-contained. It owns its route, validation, and orchestration logic.
2. **Domain Isolation**: The `src/domain` directory contains pure business logic and entities. It has **no dependencies** on frameworks, databases, or external libraries.
3. **Infrastructure**: Infrastructure concerns (DB, 3rd party APIs) live in `src/infrastructure`. We use **Dependency Injection** to invert control, allowing us to swap real implementations with dummies/mocks easily.
4. **Path Aliases**: Use `@/` to import from `src/`.
   - Example: `import { User } from '@/domain/user/user';`

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v20+ recommended)
- PNPM (`npm install -g pnpm`)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Create a `.env` file in the root directory (if not present).
For local development with SQLite, simply ensure `prisma.config.ts` is configured correctly (default).

### 3. Database Setup

We use **Prisma 7**. The database connection is configured in `prisma.config.ts`.
To apply migrations and initialize the local SQLite database:

```bash
pnpm prisma:migrate
```

To regenerate the Prisma Client after schema changes:

```bash
pnpm prisma:generate
```

## 💻 Development

### Start Development Server

Runs the server with hot-reload enabled.

```bash
pnpm dev
```

The server starts at `http://localhost:3000`.

### Build for Production

Compiles TypeScript and resolves path aliases.

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

## 🔌 Infrastructure & Dependency Injection

We use a manual Dependency Injection pattern to keep things simple and explicit.

**Example: Creating a User**
The `CreateUserUseCase` depends on a `UserRepository` interface.

- **Production**: We inject `PrismaUserRepository`.
- **Testing/Local**: We can inject `InMemoryUserRepository`.

This wiring happens in the feature's `index.ts` (Composition Root for that slice).

```typescript
// src/features/auth/create-user/index.ts
const userRepository = new PrismaUserRepository()
// const userRepository = new InMemoryUserRepository(); // Easy swap!

const handler = createHandler(userRepository)
```

## 📝 Standards

1. **Imports**: Always use absolute imports with `@/`.
2. **Validation**: Use **Zod** for request validation in the handler.
3. **Controllers**: Keep handlers thin. Delegate logic to UseCases.
4. **Database**:
   - Use `prisma.config.ts` for connection configuration.
   - Do **not** use `url` in `schema.prisma` (deprecated in our setup).
   - Always access Prisma via the singleton at `@/shared/db/client`.

## 🐶 Husky

This project uses **Husky** to manage Git hooks, ensuring better development workflows.

### Installed Hooks

- **commit-msg**: Ensures that commit messages follow the defined convention.

  ```bash
  pnpm exec commitlint --edit "$1"
  ```

- **pre-commit**: Runs `lint-staged` to validate staged files before committing.

  ```bash
  pnpm run lint-staged
  ```

- **pre-push**: Runs the production build before pushing changes.

  ```bash
  pnpm build:production
  ```

### Enabling Husky

Husky is already configured in this project. After cloning, make sure to install dependencies (`pnpm install`) to set up the hooks automatically.

## 📝 Commit Standards

This project uses **Commitlint** to enforce commit message conventions. The convention used is based on [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

### Example

```text
feat: add dynamic button functionality
```

### Using Commitizen

To simplify the creation of commit messages that follow the conventional commit standard, this project includes **Commitizen**.

```bash
pnpm commit
```

Commitizen will prompt you to fill out the commit details interactively.

## 🔖 Versioning & Releases

This project uses the **commit-and-tag-version** package to automate versioning and tagging based on commit messages.

### Release Workflow

1. Ensure all relevant changes are committed.
2. Run one of the following commands based on the desired release type:
   - **Standard Release**:

   ```bash
   pnpm release
   ```

   - **Preview Release (Dry Run)**:

   ```bash
   pnpm release:preview
   ```

   - **Development Prerelease (Alpha)**:

   ```bash
   pnpm release:develop
   ```

   - **Homologation Prerelease (Beta)**:

   ```bash
   pnpm release:homolog
   ```

3. Push the changes and tags:

   ```bash
   git push origin --follow-tags
   ```

### Scripts Overview

| Script                 | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `pnpm release`         | Standard release based on commit history       |
| `pnpm release:preview` | Preview release process without actual changes |
| `pnpm release:develop` | Create a development prerelease (alpha)        |
| `pnpm release:homolog` | Create a homologation prerelease (beta)        |

## 🧪 Testing Endpoints

**Health Check**:

```bash
curl http://localhost:3000/health
```
