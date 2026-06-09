import { PoolClient, QueryResult } from 'pg';
import pool from '../database/database';

// =============================================================
//  TIPOS / DTOs
// =============================================================

/** Payload recebido pelo serviço para inserir um novo jogo. */
export interface GameInsertDTO {
  titulo:             string;
  duracao_media?:     number | null;    // em horas
  categoria?:         string | null;
  id_desenvolvedora?: number | null;
  id_distribuidora?:  number | null;
  data_lancamento?:   string | null;    // ISO 8601: 'YYYY-MM-DD'
  id_classificacao?:  number | null;
  ids_generos?:       number[];         // associações N:M
  ids_plataformas?:   number[];         // associações N:M
}

/** Linha retornada pela query de listagem (após JOINs + agregação). */
export interface GameRow {
  id:              number;
  titulo:          string;
  duracao_media:   number | null;
  categoria:       string | null;
  desenvolvedora:  string | null;
  distribuidora:   string | null;
  data_lancamento: string | null;
  classificacao:   string | null;
  generos:         string | null;    // ex: "Ação, Aventura, RPG"
  plataformas:     string | null;    // ex: "PC, PS5"
}


// =============================================================
//  INSERT: Inserir um jogo completo (com transação)
// =============================================================

/**
 * Insere um jogo e suas associações N:M (gêneros e plataformas)
 * de forma atômica, usando uma transação explícita.
 *
 * @returns O ID do jogo recém-criado.
 * @throws  Lança o erro original após executar ROLLBACK.
 */
export async function insertGame(data: GameInsertDTO): Promise<number> {
  // Obtemos um cliente dedicado da pool para controlar a transação manualmente
  const client: PoolClient = await pool.connect();

  try {
    // ----------------------------------------------------------
    // PASSO 0 – Iniciar transação
    // ----------------------------------------------------------
    await client.query('BEGIN');

    // ----------------------------------------------------------
    // PASSO 1 – Inserir a linha principal na tabela 'jogos'
    //   $1 … $7 → parâmetros parametrizados (previnem SQL Injection)
    // ----------------------------------------------------------
    const insertGameSQL = `
      INSERT INTO jogos (
        titulo,
        duracao_media,
        categoria,
        id_desenvolvedora,
        id_distribuidora,
        data_lancamento,
        id_classificacao
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `;

    const gameResult: QueryResult<{ id: number }> = await client.query(
      insertGameSQL,
      [
        data.titulo,
        data.duracao_media    ?? null,
        data.categoria        ?? null,
        data.id_desenvolvedora ?? null,
        data.id_distribuidora  ?? null,
        data.data_lancamento   ?? null,
        data.id_classificacao  ?? null,
      ]
    );

    const newGameId = gameResult.rows[0].id;

    // ----------------------------------------------------------
    // PASSO 2 – Inserir relações N:M com Gêneros
    //   ON CONFLICT … DO NOTHING: idempotente (sem erro duplicado)
    // ----------------------------------------------------------
    if (data.ids_generos && data.ids_generos.length > 0) {
      const insertGenreSQL = `
        INSERT INTO jogo_genero (id_jogo, id_genero)
        VALUES ($1, $2)
        ON CONFLICT (id_jogo, id_genero) DO NOTHING;
      `;
      for (const idGenero of data.ids_generos) {
        await client.query(insertGenreSQL, [newGameId, idGenero]);
      }
    }

    // ----------------------------------------------------------
    // PASSO 3 – Inserir relações N:M com Plataformas
    // ----------------------------------------------------------
    if (data.ids_plataformas && data.ids_plataformas.length > 0) {
      const insertPlatformSQL = `
        INSERT INTO jogo_plataforma (id_jogo, id_plataforma)
        VALUES ($1, $2)
        ON CONFLICT (id_jogo, id_plataforma) DO NOTHING;
      `;
      for (const idPlataforma of data.ids_plataformas) {
        await client.query(insertPlatformSQL, [newGameId, idPlataforma]);
      }
    }

    // ----------------------------------------------------------
    // PASSO 4 – Confirmar transação
    // ----------------------------------------------------------
    await client.query('COMMIT');

    console.log(`[GameRepository] Jogo inserido com sucesso. ID: ${newGameId}`);
    return newGameId;

  } catch (error) {
    // Em qualquer falha: desfaz tudo para manter consistência
    await client.query('ROLLBACK');
    console.error('[GameRepository] Transação revertida (ROLLBACK):', error);
    throw error;

  } finally {
    // Sempre devolver o cliente à pool, com ou sem erro
    client.release();
  }
}


// =============================================================
//  SELECT: Listar todos os jogos com dados completos
// =============================================================

/**
 * Retorna todos os jogos com informações de desenvolvedora,
 * distribuidora, classificação, gêneros e plataformas.
 *
 * Técnicas SQL utilizadas:
 *  - LEFT JOIN:      preserva jogos sem associações opcionais
 *  - STRING_AGG:     agrega múltiplos gêneros/plataformas em uma string
 *  - DISTINCT:       evita duplicatas na agregação
 *  - TO_CHAR:        formata a data como 'YYYY-MM-DD'
 *  - GROUP BY:       obrigatório por causa do STRING_AGG
 */
export async function listGames(): Promise<GameRow[]> {
  const listGamesSQL = `
    SELECT
      j.id,
      j.titulo,
      j.duracao_media,
      j.categoria,
      dev.nome                                         AS desenvolvedora,
      dis.nome                                         AS distribuidora,
      TO_CHAR(j.data_lancamento, 'YYYY-MM-DD')        AS data_lancamento,
      ci.faixa_etaria                                  AS classificacao,
      STRING_AGG(DISTINCT g.nome, ', ' ORDER BY g.nome)  AS generos,
      STRING_AGG(DISTINCT p.nome, ', ' ORDER BY p.nome)  AS plataformas
    FROM
      jogos j
      LEFT JOIN desenvolvedora         dev  ON j.id_desenvolvedora = dev.id
      LEFT JOIN distribuidora          dis  ON j.id_distribuidora  = dis.id
      LEFT JOIN classificacao_indicativa ci  ON j.id_classificacao  = ci.id
      LEFT JOIN jogo_genero            jg   ON j.id = jg.id_jogo
      LEFT JOIN genero                 g    ON jg.id_genero = g.id
      LEFT JOIN jogo_plataforma        jp   ON j.id = jp.id_jogo
      LEFT JOIN plataforma             p    ON jp.id_plataforma = p.id
    GROUP BY
      j.id,
      dev.nome,
      dis.nome,
      ci.faixa_etaria
    ORDER BY
      j.titulo ASC;
  `;

  const result: QueryResult<GameRow> = await pool.query(listGamesSQL);
  return result.rows;
}


// =============================================================
//  SELECT: Buscar um único jogo pelo ID
// =============================================================

/**
 * Retorna um jogo específico com todos os seus detalhes,
 * ou null caso o ID não exista.
 *
 * Usa a mesma estrutura de JOINs da listagem, com filtro WHERE.
 * O parâmetro $1 é enviado de forma segura pelo driver pg.
 */
export async function getGameById(id: number): Promise<GameRow | null> {
  const getGameSQL = `
    SELECT
      j.id,
      j.titulo,
      j.duracao_media,
      j.categoria,
      dev.nome                                         AS desenvolvedora,
      dis.nome                                         AS distribuidora,
      TO_CHAR(j.data_lancamento, 'YYYY-MM-DD')        AS data_lancamento,
      ci.faixa_etaria                                  AS classificacao,
      STRING_AGG(DISTINCT g.nome, ', ' ORDER BY g.nome)  AS generos,
      STRING_AGG(DISTINCT p.nome, ', ' ORDER BY p.nome)  AS plataformas
    FROM
      jogos j
      LEFT JOIN desenvolvedora         dev  ON j.id_desenvolvedora = dev.id
      LEFT JOIN distribuidora          dis  ON j.id_distribuidora  = dis.id
      LEFT JOIN classificacao_indicativa ci  ON j.id_classificacao  = ci.id
      LEFT JOIN jogo_genero            jg   ON j.id = jg.id_jogo
      LEFT JOIN genero                 g    ON jg.id_genero = g.id
      LEFT JOIN jogo_plataforma        jp   ON j.id = jp.id_jogo
      LEFT JOIN plataforma             p    ON jp.id_plataforma = p.id
    WHERE
      j.id = $1
    GROUP BY
      j.id,
      dev.nome,
      dis.nome,
      ci.faixa_etaria;
  `;

  const result: QueryResult<GameRow> = await pool.query(getGameSQL, [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}


// =============================================================
//  UPDATE: Atualizar um jogo existente (com transação)
// =============================================================
export async function updateGame(id: number, data: GameInsertDTO): Promise<boolean> {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');

    const sql = `
      UPDATE jogos SET
        titulo=$1, duracao_media=$2, categoria=$3,
        id_desenvolvedora=$4, id_distribuidora=$5,
        data_lancamento=$6, id_classificacao=$7
      WHERE id=$8;
    `;
    const result = await client.query(sql, [
      data.titulo, data.duracao_media ?? null, data.categoria ?? null,
      data.id_desenvolvedora ?? null, data.id_distribuidora ?? null,
      data.data_lancamento ?? null, data.id_classificacao ?? null, id,
    ]);

    if ((result.rowCount ?? 0) === 0) { await client.query('ROLLBACK'); return false; }

    // Recria as associações N:M
    await client.query('DELETE FROM jogo_genero WHERE id_jogo=$1;', [id]);
    await client.query('DELETE FROM jogo_plataforma WHERE id_jogo=$1;', [id]);

    for (const idGenero of data.ids_generos ?? []) {
      await client.query('INSERT INTO jogo_genero (id_jogo,id_genero) VALUES ($1,$2) ON CONFLICT DO NOTHING;', [id, idGenero]);
    }
    for (const idPlat of data.ids_plataformas ?? []) {
      await client.query('INSERT INTO jogo_plataforma (id_jogo,id_plataforma) VALUES ($1,$2) ON CONFLICT DO NOTHING;', [id, idPlat]);
    }

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// =============================================================
//  DELETE: Remover um jogo (CASCADE cuida das tabelas N:M)
// =============================================================
export async function deleteGame(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM jogos WHERE id=$1;', [id]);
  return (result.rowCount ?? 0) > 0;
}
