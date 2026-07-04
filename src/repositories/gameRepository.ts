import { PoolClient, QueryResult } from 'pg';
import pool from '../database/database';


export interface GameInsertDTO {
  titulo:             string;
  duracao_media?:     number | null;
  categoria?:         string | null;
  id_desenvolvedora?: number | null;
  id_distribuidora?:  number | null;
  data_lancamento?:   string | null;
  id_classificacao?:  number | null;
  ids_generos?:       number[]; 
  ids_plataformas?:   number[]; 
}

export interface GameRow {
  id:              number;
  titulo:          string;
  duracao_media:   number | null;
  categoria:       string | null;
  desenvolvedora:  string | null;
  distribuidora:   string | null;
  data_lancamento: string | null;
  classificacao:   string | null;
  generos:         string | null;
  plataformas:     string | null;
}



/**
 * Insere um jogo e suas associações N:M (gêneros e plataformas)
 * de forma atômica, usando uma transação explícita.
 *
 * @returns O ID do jogo recém-criado.
 * @throws  Lança o erro original após executar ROLLBACK.
 */
export async function insertGame(data: GameInsertDTO): Promise<number> {
 
  const client: PoolClient = await pool.connect();

  try {
    await client.query('BEGIN');
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

    await client.query('COMMIT');

    console.log(`[GameRepository] Jogo inserido com sucesso. ID: ${newGameId}`);
    return newGameId;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[GameRepository] Transação revertida (ROLLBACK):', error);
    throw error;

  } finally {
    client.release();
  }
}



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

export async function deleteGame(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM jogos WHERE id=$1;', [id]);
  return (result.rowCount ?? 0) > 0;
}
