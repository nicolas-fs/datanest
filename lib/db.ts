// ============================================================
// DataNest - Módulo de conexión a la base de datos
// Usa pg (node-postgres) con pool de conexiones
// Optimizado para entornos serverless (Neon / Vercel)
// ============================================================

import { Pool, type PoolClient, type QueryResult } from "pg";

// --- Singleton del pool de conexiones ---
// En serverless, crear nuevas conexiones por cada invocación es costoso.
// Guardamos el pool en la variable global para reutilizarlo.
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
    max: 10,                // Máximo de conexiones simultáneas
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

// Reutilizar pool entre hot-reloads en desarrollo
const pool: Pool = global._pgPool ?? createPool();
if (process.env.NODE_ENV !== "production") global._pgPool = pool;

// --- Helper principal de query ---
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;

  // Log de queries lentas (>500ms) para identificar cuellos de botella
  if (duration > 500) {
    console.warn("[DB] Query lenta detectada:", { text, duration, rows: result.rowCount });
  }

  return result;
}

// --- Transacciones ---
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export { pool };
