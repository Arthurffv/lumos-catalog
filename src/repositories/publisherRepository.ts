import { QueryResult } from 'pg';
import pool from '../database/database';

export interface PublisherRow { id: number; nome: string; cnpj: string | null; pais: string | null; }
export interface PublisherDTO  { nome: string; cnpj?: string | null; pais?: string | null; }

export async function listPublishers(): Promise<PublisherRow[]> {
  const result: QueryResult<PublisherRow> = await pool.query(
    'SELECT id, nome, cnpj, pais FROM distribuidora ORDER BY nome ASC;'
  );
  return result.rows;
}

export async function getPublisherById(id: number): Promise<PublisherRow | null> {
  const result: QueryResult<PublisherRow> = await pool.query(
    'SELECT id, nome, cnpj, pais FROM distribuidora WHERE id=$1;', [id]
  );
  return result.rows[0] ?? null;
}

export async function insertPublisher(data: PublisherDTO): Promise<number> {
  const result: QueryResult<{ id: number }> = await pool.query(
    'INSERT INTO distribuidora (nome, cnpj, pais) VALUES ($1,$2,$3) RETURNING id;',
    [data.nome, data.cnpj ?? null, data.pais ?? null]
  );
  return result.rows[0].id;
}

export async function updatePublisher(id: number, data: PublisherDTO): Promise<boolean> {
  const result = await pool.query(
    'UPDATE distribuidora SET nome=$1, cnpj=$2, pais=$3 WHERE id=$4;',
    [data.nome, data.cnpj ?? null, data.pais ?? null, id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function deletePublisher(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM distribuidora WHERE id=$1;', [id]);
  return (result.rowCount ?? 0) > 0;
}
