-- Cenário de teste
-- -------------------------------------------------------------
-- DESENVOLVEDORAS
-- -------------------------------------------------------------
INSERT INTO desenvolvedora (nome, cnpj, estudio, diretor, pais, data_fundacao)
SELECT * FROM (VALUES
    ('CD Projekt Red',       '11.111.111/1111-11', 'CD Projekt',                     'Adam Badowski',       'Polônia',        DATE '2002-02-01'),
    ('Nintendo EPD',         '12.222.222/2222-22', 'Nintendo',                       'Shinya Takahashi',    'Japão',          DATE '2015-09-16'),
    ('Rockstar North',       '13.333.333/3333-33', 'Rockstar Games',                 'Aaron Garbut',        'Reino Unido',   DATE '1987-01-01'),
    ('FromSoftware',         '14.444.444/4444-44', 'FromSoftware',                   'Hidetaka Miyazaki',   'Japão',          DATE '1986-11-01'),
    ('Santa Monica Studio',  '15.555.555/5555-55', 'PlayStation Studios',            'Cory Barlog',         'Estados Unidos',DATE '1999-01-01'),
    ('Naughty Dog',          '16.666.666/6666-66', 'PlayStation Studios',            'Neil Druckmann',      'Estados Unidos',DATE '1984-09-27'),
    ('Mojang Studios',       '17.777.777/7777-77', 'Xbox Game Studios',              'Agnes Larsson',       'Suécia',         DATE '2009-05-17'),
    ('Valve',                '18.888.888/8888-88', 'Valve',                          'Gabe Newell',         'Estados Unidos',DATE '1996-08-24'),
    ('Capcom',               '19.999.999/9999-99', 'Capcom',                         'Haruhito Tsujimoto',  'Japão',          DATE '1979-05-30'),
    ('Ubisoft Montreal',     '20.101.010/1010-10', 'Ubisoft',                        'Yannis Mallat',       'Canadá',         DATE '1997-04-25'),
    ('Polyphony Digital',    '21.121.212/1212-12', 'Sony Interactive Entertainment', 'Kazunori Yamauchi',   'Japão',          DATE '1998-04-02')
) AS v(nome, cnpj, estudio, diretor, pais, data_fundacao)
WHERE NOT EXISTS (
    SELECT 1 FROM desenvolvedora d WHERE d.nome = v.nome
);

UPDATE desenvolvedora d
SET
    cnpj = COALESCE(d.cnpj, v.cnpj),
    estudio = COALESCE(d.estudio, v.estudio),
    diretor = COALESCE(d.diretor, v.diretor),
    pais = COALESCE(d.pais, v.pais),
    data_fundacao = COALESCE(d.data_fundacao, v.data_fundacao)
FROM (VALUES
    ('CD Projekt Red',       '11.111.111/1111-11', 'CD Projekt',                     'Adam Badowski',       'Polônia',        DATE '2002-02-01'),
    ('Nintendo EPD',         '12.222.222/2222-22', 'Nintendo',                       'Shinya Takahashi',    'Japão',          DATE '2015-09-16'),
    ('Rockstar North',       '13.333.333/3333-33', 'Rockstar Games',                 'Aaron Garbut',        'Reino Unido',   DATE '1987-01-01'),
    ('FromSoftware',         '14.444.444/4444-44', 'FromSoftware',                   'Hidetaka Miyazaki',   'Japão',          DATE '1986-11-01'),
    ('Santa Monica Studio',  '15.555.555/5555-55', 'PlayStation Studios',            'Cory Barlog',         'Estados Unidos',DATE '1999-01-01'),
    ('Naughty Dog',          '16.666.666/6666-66', 'PlayStation Studios',            'Neil Druckmann',      'Estados Unidos',DATE '1984-09-27'),
    ('Mojang Studios',       '17.777.777/7777-77', 'Xbox Game Studios',              'Agnes Larsson',       'Suécia',         DATE '2009-05-17'),
    ('Valve',                '18.888.888/8888-88', 'Valve',                          'Gabe Newell',         'Estados Unidos',DATE '1996-08-24'),
    ('Capcom',               '19.999.999/9999-99', 'Capcom',                         'Haruhito Tsujimoto',  'Japão',          DATE '1979-05-30'),
    ('Ubisoft Montreal',     '20.101.010/1010-10', 'Ubisoft',                        'Yannis Mallat',       'Canadá',         DATE '1997-04-25'),
    ('Polyphony Digital',    '21.121.212/1212-12', 'Sony Interactive Entertainment', 'Kazunori Yamauchi',   'Japão',          DATE '1998-04-02')
) AS v(nome, cnpj, estudio, diretor, pais, data_fundacao)
WHERE d.nome = v.nome;

-- -------------------------------------------------------------
-- DISTRIBUIDORAS
-- -------------------------------------------------------------
INSERT INTO distribuidora (nome, cnpj, pais)
SELECT * FROM (VALUES
    ('CD Projekt',                   '31.111.111/1111-11', 'Polônia'),
    ('Nintendo',                     '32.222.222/2222-22', 'Japão'),
    ('Rockstar Games',               '33.333.333/3333-33', 'Estados Unidos'),
    ('Bandai Namco Entertainment',   '34.444.444/4444-44', 'Japão'),
    ('Sony Interactive Entertainment','35.555.555/5555-55','Japão'),
    ('Xbox Game Studios',            '36.666.666/6666-66', 'Estados Unidos'),
    ('Valve',                        '37.777.777/7777-77', 'Estados Unidos'),
    ('Capcom',                       '38.888.888/8888-88', 'Japão'),
    ('Ubisoft',                      '39.999.999/9999-99', 'França')
) AS v(nome, cnpj, pais)
WHERE NOT EXISTS (
    SELECT 1 FROM distribuidora d WHERE d.nome = v.nome
);

UPDATE distribuidora d
SET
    cnpj = COALESCE(d.cnpj, v.cnpj),
    pais = COALESCE(d.pais, v.pais)
FROM (VALUES
    ('CD Projekt',                   '31.111.111/1111-11', 'Polônia'),
    ('Nintendo',                     '32.222.222/2222-22', 'Japão'),
    ('Rockstar Games',               '33.333.333/3333-33', 'Estados Unidos'),
    ('Bandai Namco Entertainment',   '34.444.444/4444-44', 'Japão'),
    ('Sony Interactive Entertainment','35.555.555/5555-55','Japão'),
    ('Xbox Game Studios',            '36.666.666/6666-66', 'Estados Unidos'),
    ('Valve',                        '37.777.777/7777-77', 'Estados Unidos'),
    ('Capcom',                       '38.888.888/8888-88', 'Japão'),
    ('Ubisoft',                      '39.999.999/9999-99', 'França')
) AS v(nome, cnpj, pais)
WHERE d.nome = v.nome;

-- -------------------------------------------------------------
-- JOGOS
-- -------------------------------------------------------------
INSERT INTO jogos (
    titulo,
    duracao_media,
    categoria,
    id_desenvolvedora,
    id_distribuidora,
    data_lancamento,
    id_classificacao
)
SELECT
    v.titulo,
    v.duracao_media,
    v.categoria,
    (SELECT id FROM desenvolvedora WHERE nome = v.desenvolvedora),
    (SELECT id FROM distribuidora WHERE nome = v.distribuidora),
    v.data_lancamento,
    (SELECT id FROM classificacao_indicativa WHERE faixa_etaria = v.classificacao)
FROM (VALUES
    ('The Witcher 3: Wild Hunt',                    50, 'RPG de mundo aberto',      'CD Projekt Red',      'CD Projekt',                    DATE '2015-05-19', '16+'),
    ('The Legend of Zelda: Breath of the Wild',     45, 'Aventura',                 'Nintendo EPD',        'Nintendo',                      DATE '2017-03-03', '14+'),
    ('Grand Theft Auto V',                          32, 'Ação e mundo aberto',      'Rockstar North',      'Rockstar Games',                DATE '2013-09-17', '18+'),
    ('Elden Ring',                                  60, 'RPG de ação',              'FromSoftware',        'Bandai Namco Entertainment',    DATE '2022-02-25', '16+'),
    ('God of War Ragnarok',                         26, 'Ação e aventura',          'Santa Monica Studio', 'Sony Interactive Entertainment',DATE '2022-11-09', '16+'),
    ('The Last of Us Part II',                      24, 'Ação e aventura',          'Naughty Dog',         'Sony Interactive Entertainment',DATE '2020-06-19', '18+'),
    ('Minecraft',                                   80, 'Sandbox',                  'Mojang Studios',      'Xbox Game Studios',             DATE '2011-11-18', '10+'),
    ('Portal 2',                                     8, 'Puzzle',                   'Valve',               'Valve',                         DATE '2011-04-19', '10+'),
    ('Resident Evil 4 Remake',                      16, 'Terror de sobrevivência',  'Capcom',              'Capcom',                        DATE '2023-03-24', '18+'),
    ('Assassins Creed Odyssey',                     45, 'RPG de ação',              'Ubisoft Montreal',    'Ubisoft',                       DATE '2018-10-05', '18+'),
    ('Gran Turismo 7',                              35, 'Corrida',                  'Polyphony Digital',   'Sony Interactive Entertainment',DATE '2022-03-04', 'Livre'),
    ('Super Mario Odyssey',                         13, 'Plataforma',               'Nintendo EPD',        'Nintendo',                      DATE '2017-10-27', 'Livre'),
    ('Counter-Strike 2',                           100, 'FPS competitivo',          'Valve',               'Valve',                         DATE '2023-09-27', '16+')
) AS v(titulo, duracao_media, categoria, desenvolvedora, distribuidora, data_lancamento, classificacao)
WHERE NOT EXISTS (
    SELECT 1 FROM jogos j WHERE j.titulo = v.titulo
);

UPDATE jogos j
SET
    duracao_media = COALESCE(j.duracao_media, v.duracao_media),
    categoria = COALESCE(j.categoria, v.categoria),
    id_desenvolvedora = COALESCE(j.id_desenvolvedora, (SELECT id FROM desenvolvedora WHERE nome = v.desenvolvedora)),
    id_distribuidora = COALESCE(j.id_distribuidora, (SELECT id FROM distribuidora WHERE nome = v.distribuidora)),
    data_lancamento = COALESCE(j.data_lancamento, v.data_lancamento),
    id_classificacao = COALESCE(j.id_classificacao, (SELECT id FROM classificacao_indicativa WHERE faixa_etaria = v.classificacao))
FROM (VALUES
    ('The Witcher 3: Wild Hunt',                    50, 'RPG de mundo aberto',      'CD Projekt Red',      'CD Projekt',                    DATE '2015-05-19', '16+'),
    ('The Legend of Zelda: Breath of the Wild',     45, 'Aventura',                 'Nintendo EPD',        'Nintendo',                      DATE '2017-03-03', '14+'),
    ('Grand Theft Auto V',                          32, 'Ação e mundo aberto',      'Rockstar North',      'Rockstar Games',                DATE '2013-09-17', '18+'),
    ('Elden Ring',                                  60, 'RPG de ação',              'FromSoftware',        'Bandai Namco Entertainment',    DATE '2022-02-25', '16+'),
    ('God of War Ragnarok',                         26, 'Ação e aventura',          'Santa Monica Studio', 'Sony Interactive Entertainment',DATE '2022-11-09', '16+'),
    ('The Last of Us Part II',                      24, 'Ação e aventura',          'Naughty Dog',         'Sony Interactive Entertainment',DATE '2020-06-19', '18+'),
    ('Minecraft',                                   80, 'Sandbox',                  'Mojang Studios',      'Xbox Game Studios',             DATE '2011-11-18', '10+'),
    ('Portal 2',                                     8, 'Puzzle',                   'Valve',               'Valve',                         DATE '2011-04-19', '10+'),
    ('Resident Evil 4 Remake',                      16, 'Terror de sobrevivência',  'Capcom',              'Capcom',                        DATE '2023-03-24', '18+'),
    ('Assassins Creed Odyssey',                     45, 'RPG de ação',              'Ubisoft Montreal',    'Ubisoft',                       DATE '2018-10-05', '18+'),
    ('Gran Turismo 7',                              35, 'Corrida',                  'Polyphony Digital',   'Sony Interactive Entertainment',DATE '2022-03-04', 'Livre'),
    ('Super Mario Odyssey',                         13, 'Plataforma',               'Nintendo EPD',        'Nintendo',                      DATE '2017-10-27', 'Livre'),
    ('Counter-Strike 2',                           100, 'FPS competitivo',          'Valve',               'Valve',                         DATE '2023-09-27', '16+')
) AS v(titulo, duracao_media, categoria, desenvolvedora, distribuidora, data_lancamento, classificacao)
WHERE j.titulo = v.titulo;

-- -------------------------------------------------------------
-- RELACAO JOGO x GENERO
-- -------------------------------------------------------------
INSERT INTO jogo_genero (id_jogo, id_genero)
SELECT j.id, g.id
FROM (VALUES
    ('The Witcher 3: Wild Hunt', 'RPG'),
    ('The Witcher 3: Wild Hunt', 'Aventura'),
    ('The Legend of Zelda: Breath of the Wild', 'Aventura'),
    ('The Legend of Zelda: Breath of the Wild', 'Ação'),
    ('Grand Theft Auto V', 'Ação'),
    ('Grand Theft Auto V', 'Aventura'),
    ('Elden Ring', 'RPG'),
    ('Elden Ring', 'Ação'),
    ('Elden Ring', 'Aventura'),
    ('God of War Ragnarok', 'Ação'),
    ('God of War Ragnarok', 'Aventura'),
    ('The Last of Us Part II', 'Ação'),
    ('The Last of Us Part II', 'Aventura'),
    ('The Last of Us Part II', 'Terror'),
    ('Minecraft', 'Aventura'),
    ('Minecraft', 'Simulação'),
    ('Portal 2', 'Puzzle'),
    ('Portal 2', 'Aventura'),
    ('Resident Evil 4 Remake', 'Terror'),
    ('Resident Evil 4 Remake', 'Ação'),
    ('Assassins Creed Odyssey', 'RPG'),
    ('Assassins Creed Odyssey', 'Ação'),
    ('Assassins Creed Odyssey', 'Aventura'),
    ('Gran Turismo 7', 'Esporte'),
    ('Gran Turismo 7', 'Simulação'),
    ('Super Mario Odyssey', 'Plataforma'),
    ('Super Mario Odyssey', 'Aventura'),
    ('Counter-Strike 2', 'FPS'),
    ('Counter-Strike 2', 'Ação')
) AS v(titulo, genero)
JOIN jogos j ON j.titulo = v.titulo
JOIN genero g ON g.nome = v.genero
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- RELACAO JOGO x PLATAFORMA
-- -------------------------------------------------------------
INSERT INTO jogo_plataforma (id_jogo, id_plataforma)
SELECT j.id, p.id
FROM (VALUES
    ('The Witcher 3: Wild Hunt', 'PC'),
    ('The Witcher 3: Wild Hunt', 'PS5'),
    ('The Witcher 3: Wild Hunt', 'Xbox Series X'),
    ('The Legend of Zelda: Breath of the Wild', 'Nintendo Switch'),
    ('Grand Theft Auto V', 'PC'),
    ('Grand Theft Auto V', 'PS5'),
    ('Grand Theft Auto V', 'Xbox Series X'),
    ('Grand Theft Auto V', 'PS4'),
    ('Grand Theft Auto V', 'Xbox One'),
    ('Elden Ring', 'PC'),
    ('Elden Ring', 'PS5'),
    ('Elden Ring', 'Xbox Series X'),
    ('Elden Ring', 'PS4'),
    ('Elden Ring', 'Xbox One'),
    ('God of War Ragnarok', 'PS5'),
    ('God of War Ragnarok', 'PS4'),
    ('The Last of Us Part II', 'PS5'),
    ('The Last of Us Part II', 'PS4'),
    ('Minecraft', 'PC'),
    ('Minecraft', 'Nintendo Switch'),
    ('Minecraft', 'PS4'),
    ('Minecraft', 'Xbox One'),
    ('Portal 2', 'PC'),
    ('Portal 2', 'Xbox One'),
    ('Resident Evil 4 Remake', 'PC'),
    ('Resident Evil 4 Remake', 'PS5'),
    ('Resident Evil 4 Remake', 'Xbox Series X'),
    ('Resident Evil 4 Remake', 'PS4'),
    ('Assassins Creed Odyssey', 'PC'),
    ('Assassins Creed Odyssey', 'PS4'),
    ('Assassins Creed Odyssey', 'Xbox One'),
    ('Gran Turismo 7', 'PS5'),
    ('Gran Turismo 7', 'PS4'),
    ('Super Mario Odyssey', 'Nintendo Switch'),
    ('Counter-Strike 2', 'PC')
) AS v(titulo, plataforma)
JOIN jogos j ON j.titulo = v.titulo
JOIN plataforma p ON p.nome = v.plataforma
ON CONFLICT DO NOTHING;
