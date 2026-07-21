import { Pool, PoolClient, QueryResult } from 'pg';

const DB_PASSWORD = process.env.DB_PASSWORD;

if (!DB_PASSWORD) {
  throw new Error('DB_PASSWORD não definida no .env, digite sua senha do PostgreSQL');
}

const pool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? 'catalogo_jogos',
  user: process.env.DB_USER ?? 'postgres',
  password: DB_PASSWORD,

  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

pool.on('connect', (_client: PoolClient) => {
  console.log('[DB] Nova conexão estabelecida com o PostgreSQL.');
});

pool.on('error', (err: Error) => {
  console.error('[DB] Erro inesperado em cliente ocioso da pool:', err.message);
  process.exit(-1);
});


export async function testConnection(): Promise<void> {
  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    const result: QueryResult = await client.query(
      'SELECT NOW() AS server_time, current_database() AS db_name'
    );
    const { server_time, db_name } = result.rows[0];
    console.log(`[DB] Conexão OK → banco: "${db_name}" | hora: ${server_time}`);
  } catch (err) {
    console.error('[DB] Falha ao conectar ao PostgreSQL:', (err as Error).message);
    throw err;
  } finally {
    client?.release();
  }
}


export default pool;
