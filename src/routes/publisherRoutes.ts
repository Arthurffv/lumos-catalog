import { Router, Response } from 'express';
import { listPublishers, insertPublisher, updatePublisher, deletePublisher } from '../repositories/publisherRepository';
const router = Router();

router.get('/', async (_req, res: Response) => {
  try { res.json(await listPublishers()); }
  catch { res.status(500).json({ error: 'Erro ao buscar distribuidoras' }); }
});

router.post('/', async (req, res: Response) => {
  try { res.status(201).json({ id: await insertPublisher(req.body) }); }
  catch { res.status(500).json({ error: 'Erro ao inserir distribuidora' }); }
});

router.put('/:id', async (req, res: Response) => {
  try {
    const ok = await updatePublisher(Number(req.params.id), req.body);
    if (!ok) return res.status(404).json({ error: 'Não encontrada' });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Erro ao atualizar distribuidora' }); }
});

router.delete('/:id', async (req, res: Response) => {
  try {
    const ok = await deletePublisher(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Não encontrada' });
    res.status(204).send();
  } catch { res.status(500).json({ error: 'Erro ao deletar distribuidora' }); }
});

export default router;
