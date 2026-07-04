
import { QueryResult } from 'pg';
import pool from '../database/database';

export interface GenreRow {
  id:   number;
  nome: string;
}


export async function listGenres(): Promise<GenreRow[]> {
  const sql = `
    SELECT id, nome
    FROM genero
    ORDER BY nome ASC;
  `;

  const result: QueryResult<GenreRow> = await pool.query(sql);
  return result.rows;
}

export async function getGenreById(id: number): Promise<GenreRow | null> {
  const sql = `SELECT id, nome FROM genero WHERE id = $1;`;
  const result: QueryResult<GenreRow> = await pool.query(sql, [id]);
  return result.rows[0] ?? null;
}

export async function insertGenre(nome: string): Promise<number> {
  const sql = `
    INSERT INTO genero (nome)
    VALUES ($1)
    RETURNING id;
  `;

  const result: QueryResult<{ id: number }> = await pool.query(sql, [nome]);
  return result.rows[0].id;
}


export async function deleteGenre(id: number): Promise<boolean> {
  const sql = `DELETE FROM genero WHERE id = $1;`;
  const result = await pool.query(sql, [id]);
  return (result.rowCount ?? 0) > 0;
}
