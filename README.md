# Enterprise NestJS API

An enterprise-grade backend API built with **NestJS**, **Prisma**, **PostgreSQL**, and strict TypeScript type safety. Designed with a clean architecture that isolates generated artifacts from source code, ensuring a maintainable, scalable, and robust foundation for modern distributed applications.

## 🚀 Architectural Highlights

- **Clean Separation of Concerns**: Strict isolation of auto-generated artifacts (such as Prisma client types and DTOs) from core application source code.
- **Strict Runtime Type Safety**: End-to-end type safety enforced via TypeScript (`nodenext` resolution), Prisma ORM, and rigorous DTO validation using `class-validator`.
- **Enterprise Tooling**: Configured with `pnpm` workspace standards, modular NestJS structure, and robust environment configuration management.

---

## 🛠️ Tech Stack

- **Core Framework**: [NestJS](https://nestjs.com/) (Node.js framework leveraging TypeScript)
- **ORM & Database**: [Prisma](https://www.prisma.io/) with **PostgreSQL**
- **Package Management**: `pnpm` (Monorepo/Polyrepo ready)
- **Validation & Security**: `class-validator`, `class-transformer`
- **Development Environment**: Cursor IDE, Git, Windows / Linux compatibility

---

## 📂 Project Structure

```text
├── prisma/                  # Database schema, migrations, and Prisma configuration
│   └── schema.prisma        # Primary database models and client generator setup
├── src/
│   ├── common/              # Shared guards, interceptors, filters, and decorators
│   ├── config/              # Environment and application configuration modules
│   ├── modules/             # Feature-based vertical slices (users, auth, etc.)
│   ├── app.module.ts        # Root application module
│   └── main.ts              # Application bootstrap and global middleware setup
├── tsconfig.json            # TypeScript compiler configuration (strict mode)
└── package.json             # Project dependencies and workspace scripts
```
