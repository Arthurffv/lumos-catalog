import { Router, Request, Response } from 'express';
import { listGames, getGameById, insertGame, updateGame, deleteGame } from '../repositories/gameRepository';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try { res.json(await listGames()); }
  catch { res.status(500).json({ error: 'Erro ao buscar jogos' }); }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const game = await getGameById(Number(req.params.id));
    if (!game) return res.status(404).json({ error: 'Jogo não encontrado' });
    res.json(game);
  } catch { res.status(500).json({ error: 'Erro ao buscar jogo' }); }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const id = await insertGame(req.body);
    res.status(201).json({ id });
  } catch { res.status(500).json({ error: 'Erro ao inserir jogo' }); }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const ok = await updateGame(Number(req.params.id), req.body);
    if (!ok) return res.status(404).json({ error: 'Jogo não encontrado' });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Erro ao atualizar jogo' }); }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const ok = await deleteGame(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Jogo não encontrado' });
    res.status(204).send();
  } catch { res.status(500).json({ error: 'Erro ao deletar jogo' }); }
});

export default router;
