import { QueryResult } from 'pg';
import pool from '../database/database';

export interface PlatformRow { id: number; nome: string; empresa: string | null; }
export interface PlatformDTO  { nome: string; empresa?: string | null; }

export async function listPlatforms(): Promise<PlatformRow[]> {
  const result: QueryResult<PlatformRow> = await pool.query(
    'SELECT id, nome, empresa FROM plataforma ORDER BY nome ASC;'
  );
  return result.rows;
}

export async function insertPlatform(data: PlatformDTO): Promise<number> {
  const result: QueryResult<{ id: number }> = await pool.query(
    'INSERT INTO plataforma (nome, empresa) VALUES ($1,$2) RETURNING id;',
    [data.nome, data.empresa ?? null]
  );
  return result.rows[0].id;
}
