/**
 * developerRepository.ts
 *
 * Repositório de Desenvolvedoras — Padrão Repository
 *
 * CONFORMIDADE ACADÊMICA:
 *  ✔ Nenhum ORM ou Query Builder utilizado.
 *  ✔ Toda comunicação com o banco é feita via SQL puro (raw SQL).
 *  ✔ Driver de conexão utilizado: `pg` (node-postgres) — único permitido.
 *  ✔ Todas as queries usam parâmetros posicionais ($1, $2 …) para
 *    prevenir SQL Injection, conforme boas práticas de segurança.
 *  ✔ Os métodos são chamados pelo back-end (Express) em resposta a
 *    requisições HTTP originadas na interface do usuário.
 */

import { PoolClient, QueryResult } from 'pg';
import pool from '../database/database';

// =============================================================
//  INTERFACES (Tipagem TypeScript)
// =============================================================

/**
 * Representa uma linha retornada pelo banco na tabela `desenvolvedora`.
 * Campos opcionais são NULL no banco e null em TypeScript.
 */
export interface DeveloperRow {
  id:            number;
  nome:          string;
  cnpj:          string | null;
  estudio:       string | null;
  diretor:       string | null;
  pais:          string | null;
  data_fundacao: string | null; // formatado como 'YYYY-MM-DD' via TO_CHAR
}

/**
 * DTO (Data Transfer Object) — payload recebido nas requisições
 * POST e PUT para criar ou atualizar uma desenvolvedora.
 */
export interface DeveloperDTO {
  nome:           string;
  cnpj?:          string | null;
  estudio?:       string | null;
  diretor?:       string | null;
  pais?:          string | null;
  data_fundacao?: string | null;
}

// =============================================================
//  SELECT — Listar todas as desenvolvedoras
// =============================================================

/**
 * Retorna todas as desenvolvedoras ordenadas alfabeticamente.
 *
 * SQL utilizado:
 *  - TO_CHAR: converte o tipo DATE do PostgreSQL para string 'YYYY-MM-DD',
 *    garantindo serialização JSON consistente.
 *  - ORDER BY nome ASC: ordenação alfabética no próprio banco,
 *    mais eficiente do que ordenar no JavaScript.
 */
export async function listDevelopers(): Promise<DeveloperRow[]> {
  // Consulta SQL pura — sem ORM, sem query builder
  const sql = `
    SELECT
      id,
      nome,
      cnpj,
      estudio,
      diretor,
      pais,
      TO_CHAR(data_fundacao, 'YYYY-MM-DD') AS data_fundacao
    FROM desenvolvedora
    ORDER BY nome ASC;
  `;

  // pool.query() envia o SQL diretamente ao PostgreSQL via driver pg
  const result: QueryResult<DeveloperRow> = await pool.query(sql);
  return result.rows;
}

// =============================================================
//  SELECT — Buscar desenvolvedora por ID
// =============================================================

/**
 * Retorna uma desenvolvedora específica pelo ID primário,
 * ou null caso não exista.
 *
 * SQL utilizado:
 *  - WHERE id = $1: filtro parametrizado — o driver pg substitui
 *    $1 pelo valor real de forma segura, impedindo SQL Injection.
 */
export async function getDeveloperById(id: number): Promise<DeveloperRow | null> {
  const sql = `
    SELECT
      id,
      nome,
      cnpj,
      estudio,
      diretor,
      pais,
      TO_CHAR(data_fundacao, 'YYYY-MM-DD') AS data_fundacao
    FROM desenvolvedora
    WHERE id = $1;
  `;

  // Segundo argumento de pool.query(): array de parâmetros posicionais
  const result: QueryResult<DeveloperRow> = await pool.query(sql, [id]);

  // Retorna a primeira linha ou null (nullish coalescing)
  return result.rows[0] ?? null;
}

// =============================================================
//  INSERT — Cadastrar nova desenvolvedora
// =============================================================

/**
 * Insere uma nova desenvolvedora e retorna o ID gerado pelo banco.
 *
 * SQL utilizado:
 *  - INSERT INTO … VALUES ($1 … $6): 6 parâmetros posicionais,
 *    um para cada coluna preenchida pelo usuário.
 *  - RETURNING id: cláusula do PostgreSQL que retorna o valor
 *    gerado pelo SERIAL (autoincremento) sem necessidade de
 *    uma segunda query SELECT.
 *  - ?? null: converte undefined em null antes de enviar ao banco,
 *    garantindo que campos opcionais não quebrem a query.
 */
export async function insertDeveloper(data: DeveloperDTO): Promise<number> {
  const sql = `
    INSERT INTO desenvolvedora
      (nome, cnpj, estudio, diretor, pais, data_fundacao)
    VALUES
      ($1, $2, $3, $4, $5, $6)
    RETURNING id;
  `;

  const result: QueryResult<{ id: number }> = await pool.query(sql, [
    data.nome,
    data.cnpj          ?? null,
    data.estudio        ?? null,
    data.diretor        ?? null,
    data.pais           ?? null,
    data.data_fundacao  ?? null,
  ]);

  return result.rows[0].id;
}

// =============================================================
//  UPDATE — Atualizar desenvolvedora existente
// =============================================================

/**
 * Atualiza todos os campos de uma desenvolvedora identificada pelo ID.
 * Retorna true se a linha foi encontrada e atualizada, false caso contrário.
 *
 * SQL utilizado:
 *  - UPDATE … SET campo=$N: cada coluna recebe seu parâmetro posicional.
 *  - WHERE id=$7: o ID é o último parâmetro — identifica a linha alvo.
 *  - result.rowCount: número de linhas afetadas; 0 indica ID inexistente.
 */
export async function updateDeveloper(id: number, data: DeveloperDTO): Promise<boolean> {
  const sql = `
    UPDATE desenvolvedora
    SET
      nome          = $1,
      cnpj          = $2,
      estudio       = $3,
      diretor       = $4,
      pais          = $5,
      data_fundacao = $6
    WHERE id = $7;
  `;

  const result = await pool.query(sql, [
    data.nome,
    data.cnpj          ?? null,
    data.estudio        ?? null,
    data.diretor        ?? null,
    data.pais           ?? null,
    data.data_fundacao  ?? null,
    id,                           // $7 — identificador da linha
  ]);

  return (result.rowCount ?? 0) > 0;
}

// =============================================================
//  DELETE — Remover desenvolvedora
// =============================================================

/**
 * Remove uma desenvolvedora pelo ID.
 * Retorna true se a linha existia e foi removida.
 *
 * SQL utilizado:
 *  - DELETE FROM … WHERE id=$1: remoção direta por chave primária.
 *
 * Nota: a FK em `jogos.id_desenvolvedora` usa ON DELETE SET NULL,
 * portanto os jogos associados não são removidos — apenas perdem
 * a referência à desenvolvedora.
 */
export async function deleteDeveloper(id: number): Promise<boolean> {
  const sql = `DELETE FROM desenvolvedora WHERE id = $1;`;
  const result = await pool.query(sql, [id]);
  return (result.rowCount ?? 0) > 0;
}
