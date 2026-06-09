import { Router, Response } from 'express';
import { listPlatforms, insertPlatform } from '../repositories/platformRepository';
const router = Router();

router.get('/', async (_req, res: Response) => {
  try { res.json(await listPlatforms()); }
  catch { res.status(500).json({ error: 'Erro ao buscar plataformas' }); }
});

router.post('/', async (req, res: Response) => {
  try { res.status(201).json({ id: await insertPlatform(req.body) }); }
  catch { res.status(500).json({ error: 'Erro ao inserir plataforma' }); }
});

export default router;
