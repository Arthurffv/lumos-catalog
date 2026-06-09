import { Router, Response } from 'express';
import { listRatings } from '../repositories/ratingRepository';
const router = Router();

router.get('/', async (_req, res: Response) => {
  try { res.json(await listRatings()); }
  catch { res.status(500).json({ error: 'Erro ao buscar classificações' }); }
});

export default router;
