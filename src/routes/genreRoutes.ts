import { Router, Response } from 'express';
import { listGenres, insertGenre } from '../repositories/genreRepository';
const router = Router();

router.get('/', async (_req, res: Response) => {
  try { res.json(await listGenres()); }
  catch { res.status(500).json({ error: 'Erro ao buscar gêneros' }); }
});

router.post('/', async (req, res: Response) => {
  try { res.status(201).json({ id: await insertGenre(req.body.nome) }); }
  catch { res.status(500).json({ error: 'Erro ao inserir gênero' }); }
});

export default router;
