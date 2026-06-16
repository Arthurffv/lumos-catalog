/**
 * platformRepository.ts
 *
 * Repositório de Plataformas — Padrão Repository
 *
 * CONFORMIDADE ACADÊMICA:
 *  ✔ Sem ORM ou Query Builder.
 *  ✔ SQL puro via driver `pg` (node-postgres).
 *  ✔ Parâmetros posicionais ($1, $2) em todos os comandos DML.
 *  ✔ Acionado exclusivamente por rotas HTTP do Express.
 */

import { QueryResult } from 'pg';
import pool from '../database/database';

// =============================================================
//  INTERFACES
// =============================================================

/**
 * Linha retornada pelo banco para a tabela `plataforma`.
 * `empresa` é opcional (ex: PC não pertence a uma empresa única).
 */
export interface PlatformRow {
  id:      number;
  nome:    string;
  empresa: string | null;
}

/**
 * DTO para criação de plataformas via POST.
 */
export interface PlatformDTO {
  nome:     string;
  empresa?: string | null;
}

// =============================================================
//  SELECT — Listar todas as plataformas
// =============================================================

/**
 * Retorna todas as plataformas cadastradas em ordem alfabética.
 * Utilizado para popular checkboxes no formulário de jogos.
 *
 * SQL: SELECT direto, sem JOIN — tabela independente no schema.
 */
export async function listPlatforms(): Promise<PlatformRow[]> {
  const sql = `
    SELECT id, nome, empresa
    FROM plataforma
    ORDER BY nome ASC;
  `;

  const result: QueryResult<PlatformRow> = await pool.query(sql);
  return result.rows;
}

// =============================================================
//  SELECT — Buscar plataforma por ID
// =============================================================

/**
 * Retorna uma plataforma específica ou null.
 * $1 → valor do ID passado de forma segura pelo driver pg.
 */
export async function getPlatformById(id: number): Promise<PlatformRow | null> {
  const sql = `
    SELECT id, nome, empresa
    FROM plataforma
    WHERE id = $1;
  `;

  const result: QueryResult<PlatformRow> = await pool.query(sql, [id]);
  return result.rows[0] ?? null;
}

// =============================================================
//  INSERT — Cadastrar nova plataforma
// =============================================================

/**
 * Insere uma plataforma e retorna o ID gerado pelo SERIAL.
 *
 * SQL:
 *  - $1 = nome, $2 = empresa (pode ser NULL para plataformas
 *    sem fabricante único, como "PC").
 *  - RETURNING id: retorna a PK gerada sem necessidade de SELECT extra.
 */
export async function insertPlatform(data: PlatformDTO): Promise<number> {
  const sql = `
    INSERT INTO plataforma (nome, empresa)
    VALUES ($1, $2)
    RETURNING id;
  `;

  const result: QueryResult<{ id: number }> = await pool.query(sql, [
    data.nome,
    data.empresa ?? null,
  ]);

  return result.rows[0].id;
}

// =============================================================
//  UPDATE — Atualizar plataforma
// =============================================================

/**
 * Atualiza nome e empresa de uma plataforma existente.
 * Retorna true se encontrou e atualizou, false se ID não existe.
 *
 * SQL:
 *  - SET nome=$1, empresa=$2: dois campos atualizáveis.
 *  - WHERE id=$3: identifica a linha pelo ID (PK).
 */
export async function updatePlatform(id: number, data: PlatformDTO): Promise<boolean> {
  const sql = `
    UPDATE plataforma
    SET
      nome    = $1,
      empresa = $2
    WHERE id = $3;
  `;

  const result = await pool.query(sql, [
    data.nome,
    data.empresa ?? null,
    id,
  ]);

  return (result.rowCount ?? 0) > 0;
}

// =============================================================
//  DELETE — Remover plataforma
// =============================================================

/**
 * Remove uma plataforma pelo ID.
 *
 * Nota: a FK em `jogo_plataforma.id_plataforma` usa ON DELETE CASCADE,
 * portanto as associações N:M desta plataforma são removidas junto.
 */
export async function deletePlatform(id: number): Promise<boolean> {
  const sql = `DELETE FROM plataforma WHERE id = $1;`;
  const result = await pool.query(sql, [id]);
  return (result.rowCount ?? 0) > 0;
}
