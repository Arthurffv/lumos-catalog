-- =============================================================
--  SCHEMA DDL – Catálogo de Jogos
--  Banco de Dados: PostgreSQL
--  Descrição: Cria todas as tabelas, restrições e índices
--             necessários para o sistema de catálogo.
-- =============================================================

-- -------------------------------------------------------------
-- LIMPEZA (drop na ordem inversa das dependências)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS jogo_plataforma       CASCADE;
DROP TABLE IF EXISTS jogo_genero           CASCADE;
DROP TABLE IF EXISTS jogos                 CASCADE;
DROP TABLE IF EXISTS genero                CASCADE;
DROP TABLE IF EXISTS plataforma            CASCADE;
DROP TABLE IF EXISTS desenvolvedora        CASCADE;
DROP TABLE IF EXISTS distribuidora         CASCADE;
DROP TABLE IF EXISTS classificacao_indicativa CASCADE;


-- =============================================================
--  TABELAS INDEPENDENTES (sem FK de saída)
-- =============================================================

-- -------------------------------------------------------------
-- 1. CLASSIFICAÇÃO INDICATIVA
--    Domínio controlado: 'Livre', '10+', '12+', '14+', '16+', '18+'
-- -------------------------------------------------------------
CREATE TABLE classificacao_indicativa (
    id           SERIAL      PRIMARY KEY,
    faixa_etaria VARCHAR(10) NOT NULL UNIQUE
);

-- -------------------------------------------------------------
-- 2. DESENVOLVEDORA
-- -------------------------------------------------------------
CREATE TABLE desenvolvedora (
    id            SERIAL       PRIMARY KEY,
    nome          VARCHAR(255) NOT NULL,
    cnpj          VARCHAR(18)  UNIQUE,        -- Formato: XX.XXX.XXX/XXXX-XX
    estudio       VARCHAR(255),
    diretor       VARCHAR(255),
    pais          VARCHAR(100),
    data_fundacao DATE
);

-- -------------------------------------------------------------
-- 3. DISTRIBUIDORA
-- -------------------------------------------------------------
CREATE TABLE distribuidora (
    id    SERIAL       PRIMARY KEY,
    nome  VARCHAR(255) NOT NULL,
    cnpj  VARCHAR(18)  UNIQUE,               -- Formato: XX.XXX.XXX/XXXX-XX
    pais  VARCHAR(100)
);

-- -------------------------------------------------------------
-- 4. PLATAFORMA
-- -------------------------------------------------------------
CREATE TABLE plataforma (
    id      SERIAL       PRIMARY KEY,
    nome    VARCHAR(100) NOT NULL UNIQUE,    -- 'PC', 'PS5', 'Xbox Series X', etc.
    empresa VARCHAR(255)                     -- 'Microsoft', 'Sony', 'Nintendo', etc.
);

-- -------------------------------------------------------------
-- 5. GÊNERO
-- -------------------------------------------------------------
CREATE TABLE genero (
    id   SERIAL       PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE        -- 'RPG', 'FPS', 'Aventura', etc.
);


-- =============================================================
--  TABELA CENTRAL (com FKs para as tabelas acima)
-- =============================================================

-- -------------------------------------------------------------
-- 6. JOGOS
--    Relações 1:N com: desenvolvedora, distribuidora e
--    classificacao_indicativa.
--    ON DELETE SET NULL: preserva o jogo se a empresa for removida.
-- -------------------------------------------------------------
CREATE TABLE jogos (
    id                 SERIAL       PRIMARY KEY,
    titulo             VARCHAR(255) NOT NULL,
    duracao_media      INT          CHECK (duracao_media >= 0), -- em horas
    categoria          VARCHAR(100),
    id_desenvolvedora  INT          REFERENCES desenvolvedora(id)         ON DELETE SET NULL,
    id_distribuidora   INT          REFERENCES distribuidora(id)          ON DELETE SET NULL,
    data_lancamento    DATE,
    id_classificacao   INT          REFERENCES classificacao_indicativa(id) ON DELETE SET NULL
);


-- =============================================================
--  TABELAS DE JUNÇÃO (N:M)
-- =============================================================

-- -------------------------------------------------------------
-- 7. JOGO_GENERO  (N:M entre jogos e genero)
--    ON DELETE CASCADE: remove a associação se o jogo ou gênero
--    for excluído, sem deixar registros órfãos.
-- -------------------------------------------------------------
CREATE TABLE jogo_genero (
    id_jogo   INT NOT NULL REFERENCES jogos(id)  ON DELETE CASCADE,
    id_genero INT NOT NULL REFERENCES genero(id) ON DELETE CASCADE,
    PRIMARY KEY (id_jogo, id_genero)
);

-- -------------------------------------------------------------
-- 8. JOGO_PLATAFORMA  (N:M entre jogos e plataforma)
-- -------------------------------------------------------------
CREATE TABLE jogo_plataforma (
    id_jogo       INT NOT NULL REFERENCES jogos(id)      ON DELETE CASCADE,
    id_plataforma INT NOT NULL REFERENCES plataforma(id) ON DELETE CASCADE,
    PRIMARY KEY (id_jogo, id_plataforma)
);


-- =============================================================
--  ÍNDICES  (otimizam as consultas mais comuns)
-- =============================================================

-- Busca e ordenação por título
CREATE INDEX idx_jogos_titulo          ON jogos(titulo);

-- Filtros/JOINs via FK na tabela central
CREATE INDEX idx_jogos_desenvolvedora  ON jogos(id_desenvolvedora);
CREATE INDEX idx_jogos_distribuidora   ON jogos(id_distribuidora);
CREATE INDEX idx_jogos_classificacao   ON jogos(id_classificacao);

-- Consultas inversas nas tabelas de junção (ex: "todos os jogos de um gênero")
CREATE INDEX idx_jogo_genero_genero    ON jogo_genero(id_genero);
CREATE INDEX idx_jogo_plataforma_plat  ON jogo_plataforma(id_plataforma);


-- =============================================================
--  DADOS INICIAIS (seed mínimo para desenvolvimento)
-- =============================================================

INSERT INTO classificacao_indicativa (faixa_etaria) VALUES
    ('Livre'), ('10+'), ('12+'), ('14+'), ('16+'), ('18+');

INSERT INTO genero (nome) VALUES
    ('Ação'), ('Aventura'), ('RPG'), ('FPS'), ('Estratégia'),
    ('Simulação'), ('Esporte'), ('Plataforma'), ('Terror'), ('Puzzle');

INSERT INTO plataforma (nome, empresa) VALUES
    ('PC',             'Valve / Microsoft'),
    ('PS5',            'Sony Interactive Entertainment'),
    ('Xbox Series X',  'Microsoft'),
    ('Nintendo Switch','Nintendo'),
    ('PS4',            'Sony Interactive Entertainment'),
    ('Xbox One',       'Microsoft');
