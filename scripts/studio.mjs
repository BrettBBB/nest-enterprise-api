import { spawn } from 'node:child_process';
import net from 'node:net';
import { config } from 'dotenv';

config();

function canConnect(port, host) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    const finish = (open) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(open);
    };
    socket.setTimeout(500);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

async function ensureLocalDatabase(url) {
  const host = url.hostname;
  const local = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const port = Number(url.port);
  if (!local || !port) {
    return;
  }

  const probeHost = host === 'localhost' || host === '::1' ? '127.0.0.1' : host;
  if (await canConnect(port, probeHost)) {
    return;
  }

  console.log(
    `Local Postgres is not accepting connections on port ${port}. Starting it with prisma dev.`,
  );
  const started = await new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ['node_modules/prisma/build/index.js', 'dev', '-d'],
      { stdio: 'inherit' },
    );
    child.on('exit', (code) => resolve(code ?? 1));
  });
  if (started !== 0) {
    console.error('prisma dev did not start. Studio needs that local Postgres.');
    process.exit(started);
  }

  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (await canConnect(port, probeHost)) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.error(`Postgres is still not accepting connections on port ${port}.`);
  process.exit(1);
}

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

await ensureLocalDatabase(url);

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
