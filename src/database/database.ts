import { Pool, PoolClient, QueryResult } from 'pg';

// =============================================================
//  CONFIGURAÇÃO DA POOL DE CONEXÃO
//  Todas as credenciais vêm de variáveis de ambiente (.env).
//  Nunca exponha senhas diretamente no código-fonte.
// =============================================================

const pool = new Pool({
  host:     process.env.DB_HOST     ?? 'localhost',
  port:     Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME     ?? 'catalogo_jogos',
  user:     process.env.DB_USER     ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',

  // --- Configurações da pool ---
  max:                    10,    // conexões simultâneas máximas
  idleTimeoutMillis:   30_000,   // remove conexões ociosas após 30 s
  connectionTimeoutMillis: 2_000, // lança erro se não conectar em 2 s
});

// Eventos de ciclo de vida da pool
pool.on('connect', (_client: PoolClient) => {
  console.log('[DB] Nova conexão estabelecida com o PostgreSQL.');
});

pool.on('error', (err: Error) => {
  console.error('[DB] Erro inesperado em cliente ocioso da pool:', err.message);
  process.exit(-1);
});

// =============================================================
//  FUNÇÃO AUXILIAR: testa a conectividade ao iniciar o servidor
// =============================================================
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

// =============================================================
//  EXPORTAÇÃO
//  A pool é um singleton: importada por todos os repositórios.
// =============================================================
export default pool;
