/**
 * genreRepository.ts
 *
 * Repositório de Gêneros — Padrão Repository
 *
 * CONFORMIDADE ACADÊMICA:
 *  ✔ Sem ORM ou Query Builder.
 *  ✔ SQL puro via driver `pg` (node-postgres).
 *  ✔ Parâmetros posicionais ($1) em todos os comandos DML.
 *  ✔ Acionado exclusivamente por rotas HTTP do Express.
 */

import { QueryResult } from 'pg';
import pool from '../database/database';

// =============================================================
//  INTERFACE
// =============================================================

/**
 * Representa uma linha da tabela `genero`.
 * Tabela simples: apenas id (SERIAL) e nome (VARCHAR UNIQUE).
 */
export interface GenreRow {
  id:   number;
  nome: string;
}

// =============================================================
//  SELECT — Listar todos os gêneros
// =============================================================

/**
 * Retorna todos os gêneros cadastrados, ordenados alfabeticamente.
 * Usado para popular checkboxes e filtros na interface.
 *
 * SQL:  SELECT simples sem JOIN, pois a tabela não possui FKs de saída.
 */
export async function listGenres(): Promise<GenreRow[]> {
  const sql = `
    SELECT id, nome
    FROM genero
    ORDER BY nome ASC;
  `;

  const result: QueryResult<GenreRow> = await pool.query(sql);
  return result.rows;
}

// =============================================================
//  SELECT — Buscar gênero por ID
// =============================================================

/**
 * Retorna um gênero específico ou null se não existir.
 * Parâmetro $1 previne SQL Injection.
 */
export async function getGenreById(id: number): Promise<GenreRow | null> {
  const sql = `SELECT id, nome FROM genero WHERE id = $1;`;
  const result: QueryResult<GenreRow> = await pool.query(sql, [id]);
  return result.rows[0] ?? null;
}

// =============================================================
//  INSERT — Cadastrar novo gênero
// =============================================================

/**
 * Insere um gênero e retorna o ID gerado.
 *
 * SQL:
 *  - VALUES ($1): parâmetro posicional para o nome.
 *  - RETURNING id: evita um SELECT extra após o INSERT.
 *  - A constraint UNIQUE em `nome` no schema garante integridade
 *    — o banco rejeita duplicatas automaticamente.
 */
export async function insertGenre(nome: string): Promise<number> {
  const sql = `
    INSERT INTO genero (nome)
    VALUES ($1)
    RETURNING id;
  `;

  const result: QueryResult<{ id: number }> = await pool.query(sql, [nome]);
  return result.rows[0].id;
}

// =============================================================
//  DELETE — Remover gênero
// =============================================================

/**
 * Remove um gênero pelo ID.
 *
 * Nota: a FK em `jogo_genero.id_genero` usa ON DELETE CASCADE,
 * então as associações N:M desse gênero são removidas junto.
 */
export async function deleteGenre(id: number): Promise<boolean> {
  const sql = `DELETE FROM genero WHERE id = $1;`;
  const result = await pool.query(sql, [id]);
  return (result.rowCount ?? 0) > 0;
}
