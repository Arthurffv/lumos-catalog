
import { QueryResult } from 'pg';
import pool from '../database/database';

export interface PlatformRow {
  id:      number;
  nome:    string;
  empresa: string | null;
}


export interface PlatformDTO {
  nome:     string;
  empresa?: string | null;
}


export async function listPlatforms(): Promise<PlatformRow[]> {
  const sql = `
    SELECT id, nome, empresa
    FROM plataforma
    ORDER BY nome ASC;
  `;

  const result: QueryResult<PlatformRow> = await pool.query(sql);
  return result.rows;
}


export async function getPlatformById(id: number): Promise<PlatformRow | null> {
  const sql = `
    SELECT id, nome, empresa
    FROM plataforma
    WHERE id = $1;
  `;

  const result: QueryResult<PlatformRow> = await pool.query(sql, [id]);
  return result.rows[0] ?? null;
}


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

export async function deletePlatform(id: number): Promise<boolean> {
  const sql = `DELETE FROM plataforma WHERE id = $1;`;
  const result = await pool.query(sql, [id]);
  return (result.rowCount ?? 0) > 0;
}
