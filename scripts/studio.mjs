import { spawn } from 'node:child_process';
import { config } from 'dotenv';

config();

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const url = new URL(rawUrl);
const prismaOnly = [
  'connection_limit',
  'pool_timeout',
  'socket_timeout',
  'connect_timeout',
  'max_idle_connection_lifetime',
  'schema',
  'pgbouncer',
  'statement_cache_size',
  'sslidentity',
  'sslaccept',
  'pool',
  'single_use_connections',
  'uselibpqcompat',
  'channel_binding',
];

for (const key of prismaOnly) {
  url.searchParams.delete(key);
}

// postgres.js treats any sslmode value as "use TLS". "disable" is still truthy,
// so Studio tries TLS against local Prisma Postgres and the first introspect fails.
const sslmode = url.searchParams.get('sslmode');
if (!sslmode || sslmode === 'disable' || sslmode === 'allow' || sslmode === 'prefer') {
  url.searchParams.delete('sslmode');
}

const child = spawn(
  process.execPath,
  [
    'node_modules/prisma/build/index.js',
    'studio',
    '--port',
    '5555',
    '--url',
    url.href,
  ],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: url.href,
      DIRECT_URL: url.href,
    },
  },
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  }
  process.exit(code ?? 0);
});
