# Enterprise NestJS API (`nest-enterprise-api`)

An enterprise-grade backend API built with **NestJS**, **Prisma**, **PostgreSQL**, and strict TypeScript type safety. Designed with a clean architecture that isolates generated artifacts from source code, ensuring a maintainable, scalable, and robust foundation for modern distributed applications.

---

## 🚀 Architectural Highlights

- **Clean Separation of Concerns**: Strict isolation of auto-generated artifacts (such as Prisma client types and DTOs) from core application source code.
- **Strict Runtime Type Safety**: End-to-end type safety enforced via TypeScript (`nodenext` resolution), Prisma ORM, and rigorous DTO validation using `class-validator`.
- **Enterprise Tooling**: Configured with `pnpm` workspace standards, modular NestJS structure, and robust environment configuration management.

---

## 🛠️ Tech Stack

- **Core Framework**: [NestJS](https://nestjs.com/) (Node.js framework leveraging TypeScript)
- **ORM & Database**: [Prisma](https://www.prisma.io/) with **PostgreSQL**
- **Package Management**: `pnpm` (Unified workspace tooling)
- **Validation & Security**: `class-validator`, `class-transformer`, native JWT authorization strategies
- **Development Environment**: Cursor IDE, Git, cross-platform compatibility

---

## 📂 Project Structure

├── prisma/ # Database schema, migrations, and Prisma configuration
│ └── schema.prisma # Primary database models and client generator setup
├── src/
│ ├── common/ # Shared guards, interceptors, filters, and decorators
│ ├── config/ # Environment and application configuration modules
│ ├── modules/ # Feature-based vertical slices (users, auth, etc.)
│ ├── app.module.ts # Root application module
│ └── main.ts # Application bootstrap and global middleware setup
├── tsconfig.json # TypeScript compiler configuration (strict mode)
└── package.json # Project dependencies and workspace scripts

---

## 🛠️ Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js (LTS recommended)
- pnpm (`npm install -g pnpm`)
- PostgreSQL database instance (local or hosted via Neon/Supabase)

### Installation & Local Development

1. Clone the repository and navigate into the project directory:
   cd nest-enterprise-api

2. Install dependencies using pnpm:
   pnpm install

3. Configure environment variables (copy `.env.example` to `.env` and set your database connection string):
   DATABASE_URL="postgresql://user:password@localhost:5432/enterprise_db?schema=public"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=3000

4. Run database migrations and generate the Prisma Client:
   pnpm prisma migrate dev

5. Start the development server:
   pnpm start:dev

---

## 🔗 Workspace Context

This repository operates within a multi-root workspace (`enterprise.code-workspace`) alongside its companion frontend repository (`react-enterprise-client`), demonstrating decoupled enterprise service design and scalable code organization.
