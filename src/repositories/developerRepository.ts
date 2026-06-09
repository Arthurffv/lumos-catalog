import { QueryResult } from 'pg';
import pool from '../database/database';

export interface DeveloperRow {
  id: number;
  nome: string;
  cnpj: string | null;
  estudio: string | null;
  diretor: string | null;
  pais: string | null;
  data_fundacao: string | null;
}

export interface DeveloperDTO {
  nome: string;
  cnpj?: string | null;
  estudio?: string | null;
  diretor?: string | null;
  pais?: string | null;
  data_fundacao?: string | null;
}

export async function listDevelopers(): Promise<DeveloperRow[]> {
  const sql = `
    SELECT id, nome, cnpj, estudio, diretor, pais,
           TO_CHAR(data_fundacao, 'YYYY-MM-DD') AS data_fundacao
    FROM desenvolvedora ORDER BY nome ASC;
  `;
  const result: QueryResult<DeveloperRow> = await pool.query(sql);
  return result.rows;
}

export async function getDeveloperById(id: number): Promise<DeveloperRow | null> {
  const sql = `
    SELECT id, nome, cnpj, estudio, diretor, pais,
           TO_CHAR(data_fundacao, 'YYYY-MM-DD') AS data_fundacao
    FROM desenvolvedora WHERE id = $1;
  `;
  const result: QueryResult<DeveloperRow> = await pool.query(sql, [id]);
  return result.rows[0] ?? null;
}

export async function insertDeveloper(data: DeveloperDTO): Promise<number> {
  const sql = `
    INSERT INTO desenvolvedora (nome, cnpj, estudio, diretor, pais, data_fundacao)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;
  `;
  const result: QueryResult<{ id: number }> = await pool.query(sql, [
    data.nome, data.cnpj ?? null, data.estudio ?? null,
    data.diretor ?? null, data.pais ?? null, data.data_fundacao ?? null,
  ]);
  return result.rows[0].id;
}

export async function updateDeveloper(id: number, data: DeveloperDTO): Promise<boolean> {
  const sql = `
    UPDATE desenvolvedora
    SET nome=$1, cnpj=$2, estudio=$3, diretor=$4, pais=$5, data_fundacao=$6
    WHERE id=$7;
  `;
  const result = await pool.query(sql, [
    data.nome, data.cnpj ?? null, data.estudio ?? null,
    data.diretor ?? null, data.pais ?? null, data.data_fundacao ?? null, id,
  ]);
  return (result.rowCount ?? 0) > 0;
}

export async function deleteDeveloper(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM desenvolvedora WHERE id=$1;', [id]);
  return (result.rowCount ?? 0) > 0;
}
