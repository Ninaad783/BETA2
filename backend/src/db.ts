import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Initialize PostgreSQL connection pool
export const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT) || 5432,
        database: process.env.PGDATABASE || 'medeasy_db',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
      }
);

// Typed query helper with auto-logging in development
export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DB Query] executed in ${duration}ms | rows: ${res.rowCount}`);
    }
    return res;
  } catch (error) {
    console.error(`[DB Error] query failed:`, text, error);
    throw error;
  }
};

export default {
  pool,
  query,
};
