import { Response } from 'express';

export function parseId(value: string, res: Response): number | null {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'ID inválido' });
    return null;
  }

  return id;
}

export function isRequiredString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
