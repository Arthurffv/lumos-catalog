/**
 * src/test.ts
 *
 * Script de smoke-test: roda fora do servidor Express para
 * validar a conexão com o banco e as funções do repositório.
 *
 * Como executar:
 *   npx ts-node src/test.ts
 */

import 'dotenv/config'; // carrega o .env antes de qualquer coisa

import { testConnection } from './database/database';
import { insertGame, listGames, getGameById } from './repositories/gameRepository';

async function main(): Promise<void> {
  console.log('==============================');
  console.log(' TESTE DO CATÁLOGO DE JOGOS   ');
  console.log('==============================\n');

  // ----------------------------------------------------------
  // 1. Testar conexão com o banco
  // ----------------------------------------------------------
  console.log('→ [1/3] Testando conexão com o PostgreSQL...');
  await testConnection();

  // ----------------------------------------------------------
  // 2. Inserir um jogo de exemplo
  //    ATENÇÃO: os IDs de classificação, gênero e plataforma
  //    precisam existir no banco (o schema.sql já insere o seed).
  //    id_classificacao 5 = '16+'  (seed: Livre=1, 10+=2, 12+=3, 14+=4, 16+=5, 18+=6)
  //    ids_generos [3, 1]          (seed: RPG=3, Ação=1)
  //    ids_plataformas [1, 2]      (seed: PC=1, PS5=2)
  // ----------------------------------------------------------
  console.log('\n→ [2/3] Inserindo jogo de teste...');

  const novoJogoId = await insertGame({
    titulo:             'The Witcher 3: Wild Hunt',
    duracao_media:      50,
    categoria:          'Open World',
    data_lancamento:    '2015-05-19',
    id_classificacao:   5,    // 16+
    ids_generos:        [3, 1],  // RPG, Ação
    ids_plataformas:    [1, 2],  // PC, PS5
  });

  console.log(`   ✔ Jogo inserido com ID: ${novoJogoId}`);

  // ----------------------------------------------------------
  // 3. Buscar o jogo pelo ID recém-gerado
  // ----------------------------------------------------------
  console.log('\n→ [3/3] Buscando jogo pelo ID e listando todos...');

  const jogoEspecifico = await getGameById(novoJogoId);
  console.log('\n  getGameById():');
  console.log('  ', JSON.stringify(jogoEspecifico, null, 2));

  const todosOsJogos = await listGames();
  console.log(`\n  listGames() → ${todosOsJogos.length} jogo(s) encontrado(s):`);
  console.log('  ', JSON.stringify(todosOsJogos, null, 2));

  console.log('\n==============================');
  console.log(' TODOS OS TESTES PASSARAM ✔   ');
  console.log('==============================\n');
}

// Encerra o processo ao terminar (libera as conexões da pool)
main()
  .catch((err) => {
    console.error('\n✖ ERRO NO TESTE:', err.message);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
