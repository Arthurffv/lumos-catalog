
import 'dotenv/config';

import { testConnection } from './database/database';
import { insertGame, listGames, getGameById } from './repositories/gameRepository';

async function main(): Promise<void> {
  console.log('==============================');
  console.log(' TESTE DO CATÁLOGO DE JOGOS   ');
  console.log('==============================\n');


  console.log('→ [1/3] Testando conexão com o PostgreSQL...');
  await testConnection();


  console.log('\n→ [2/3] Inserindo jogo de teste...');

  const novoJogoId = await insertGame({
    titulo:             'The Witcher 3: Wild Hunt',
    duracao_media:      50,
    categoria:          'Open World',
    data_lancamento:    '2015-05-19',
    id_classificacao:   5,    
    ids_generos:        [3, 1],  
    ids_plataformas:    [1, 2],  
  });

  console.log(`   ✔ Jogo inserido com ID: ${novoJogoId}`);


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


main()
  .catch((err) => {
    console.error('\n✖ ERRO NO TESTE:', err.message);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
