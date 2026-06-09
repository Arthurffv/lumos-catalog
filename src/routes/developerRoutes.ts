import { Router, Request, Response } from 'express';
import { listDevelopers, getDeveloperById, insertDeveloper, updateDeveloper, deleteDeveloper } from '../repositories/developerRepository';
const router = Router();

router.get('/', async (_req, res: Response) => {
  try { res.json(await listDevelopers()); }
  catch { res.status(500).json({ error: 'Erro ao buscar desenvolvedoras' }); }
});

router.get('/:id', async (req, res: Response) => {
  try {
    const dev = await getDeveloperById(Number(req.params.id));
    if (!dev) return res.status(404).json({ error: 'Não encontrada' });
    res.json(dev);
  } catch { res.status(500).json({ error: 'Erro ao buscar desenvolvedora' }); }
});

router.post('/', async (req, res: Response) => {
  try { res.status(201).json({ id: await insertDeveloper(req.body) }); }
  catch { res.status(500).json({ error: 'Erro ao inserir desenvolvedora' }); }
});

router.put('/:id', async (req, res: Response) => {
  try {
    const ok = await updateDeveloper(Number(req.params.id), req.body);
    if (!ok) return res.status(404).json({ error: 'Não encontrada' });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Erro ao atualizar desenvolvedora' }); }
});

router.delete('/:id', async (req, res: Response) => {
  try {
    const ok = await deleteDeveloper(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Não encontrada' });
    res.status(204).send();
  } catch { res.status(500).json({ error: 'Erro ao deletar desenvolvedora' }); }
});

export default router;
