import { QueryResult } from 'pg';
import pool from '../database/database';

export interface GenreRow { id: number; nome: string; }

export async function listGenres(): Promise<GenreRow[]> {
  const result: QueryResult<GenreRow> = await pool.query(
    'SELECT id, nome FROM genero ORDER BY nome ASC;'
  );
  return result.rows;
}

export async function insertGenre(nome: string): Promise<number> {
  const result: QueryResult<{ id: number }> = await pool.query(
    'INSERT INTO genero (nome) VALUES ($1) RETURNING id;', [nome]
  );
  return result.rows[0].id;
}
