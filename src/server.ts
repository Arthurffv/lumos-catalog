import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { testConnection } from './database/database';
import gameRoutes       from './routes/gameRoutes';
import developerRoutes  from './routes/developerRoutes';
import publisherRoutes  from './routes/publisherRoutes';
import platformRoutes   from './routes/platformRoutes';
import genreRoutes      from './routes/genreRoutes';
import ratingRoutes     from './routes/ratingRoutes';

const app  = express();
const PORT = process.env.PORT ?? 3000;

// ---------------------------------------------------------------
// Middlewares globais
// ---------------------------------------------------------------
app.use(cors());           // permite requisições do front-end React (porta 5173)
app.use(express.json());   // parseia body JSON automaticamente

// ---------------------------------------------------------------
// Rotas da API
// ---------------------------------------------------------------
app.use('/api/games',       gameRoutes);
app.use('/api/developers',  developerRoutes);
app.use('/api/publishers',  publisherRoutes);
app.use('/api/platforms',   platformRoutes);
app.use('/api/genres',      genreRoutes);
app.use('/api/ratings',     ratingRoutes);

// Rota raiz — confirma que o servidor está no ar
app.get('/', (_req, res) => res.json({ status: 'Catálogo de Jogos API rodando ✔' }));

// ---------------------------------------------------------------
// Inicialização
// ---------------------------------------------------------------
async function startServer(): Promise<void> {
  await testConnection();   // valida conexão com o banco antes de abrir o servidor
  app.listen(PORT, () => {
    console.log(`[Server] API rodando em http://localhost:${PORT}`);
    console.log(`[Server] Endpoints disponíveis:`);
    console.log(`         GET/POST  /api/games`);
    console.log(`         GET/POST  /api/developers`);
    console.log(`         GET/POST  /api/publishers`);
    console.log(`         GET/POST  /api/platforms`);
    console.log(`         GET       /api/genres`);
    console.log(`         GET       /api/ratings`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Falha ao iniciar:', err.message);
  process.exit(1);
});
