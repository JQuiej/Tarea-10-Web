import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL;

// En desarrollo Next recarga los modulos; reutilizamos el pool via globalThis.
const globalForPool = globalThis;

export const pool =
  globalForPool.__pgPool ?? new Pool({ connectionString, max: 10 });

if (process.env.NODE_ENV !== 'production') {
  globalForPool.__pgPool = pool;
}

export function query(text, params) {
  return pool.query(text, params);
}
