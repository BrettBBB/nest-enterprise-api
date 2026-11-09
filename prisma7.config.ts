import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

const shadowDatabaseUrl = process.env.SHADOW_DATABASE_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'pnpm prisma:seed',
  },
  datasource: {
    // Migrations use the direct connection. Locally that is the same Postgres
    // as DATABASE_URL. In production it is the Neon host without the pooler.
    url: env('DIRECT_URL'),
    ...(shadowDatabaseUrl ? { shadowDatabaseUrl } : {}),
  },
});
