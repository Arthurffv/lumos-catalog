import { QueryResult } from 'pg';
import pool from '../database/database';

export interface RatingRow { id: number; faixa_etaria: string; }

export async function listRatings(): Promise<RatingRow[]> {
  const result: QueryResult<RatingRow> = await pool.query(
    'SELECT id, faixa_etaria FROM classificacao_indicativa ORDER BY id ASC;'
  );
  return result.rows;
}
