import { Router, Request, Response } from 'express';
import { listGames, getGameById, insertGame, updateGame, deleteGame } from '../repositories/gameRepository';
import { parseId, isRequiredString } from './validation';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try { res.json(await listGames()); }
  catch { res.status(500).json({ error: 'Erro ao buscar jogos' }); }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = parseId(req.params.id, res);
  if (id === null) return;
  
  try {
    const game = await getGameById(id);
    if (!game) return res.status(404).json({ error: 'Jogo não encontrado' });
    res.json(game);
  } catch { res.status(500).json({ error: 'Erro ao buscar jogo' }); }
});

router.post('/', async (req: Request, res: Response) => {
  if (!isRequiredString(req.body.titulo)) {
    return res.status(400).json({ error: 'Título é obrigatório' });
  }
  
  try {
    const id = await insertGame(req.body);
    res.status(201).json({ id });
  } catch { res.status(500).json({ error: 'Erro ao inserir jogo' }); }
});

router.put('/:id', async (req: Request, res: Response) => {
  const id = parseId(req.params.id, res);
  if (id === null) return;
  
  try {
    const ok = await updateGame(id, req.body);
    if (!ok) return res.status(404).json({ error: 'Jogo não encontrado' });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Erro ao atualizar jogo' }); }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = parseId(req.params.id, res);
  if (id === null) return;
  
  try {
    const ok = await deleteGame(id);
    if (!ok) return res.status(404).json({ error: 'Jogo não encontrado' });
    res.status(204).send();
  } catch { res.status(500).json({ error: 'Erro ao deletar jogo' }); }
});

export default router;
