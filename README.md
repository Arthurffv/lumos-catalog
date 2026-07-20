# 🎮 Lumos Catalog

> Sistema de Banco de Dados relacional para cadastro e consulta de jogos digitais.
> Projeto prático das disciplinas **CSI440 — Banco de Dados**
> Universidade Federal de Ouro Preto (UFOP)

---

## 📋 Sobre o Projeto

O **Lumos Catalog** resolve um problema real de organização: a dificuldade de centralizar informações detalhadas sobre jogos digitais, como desenvolvedora, distribuidora, plataformas disponíveis, classificação indicativa e gêneros — tudo relacionado de forma estruturada em um banco de dados relacional.

O sistema permite **cadastrar, consultar, editar e remover** jogos e empresas diretamente pela interface web, sem nenhum acesso direto ao banco por linha de comando ou ferramentas de administração.

### Conformidade com os requisitos acadêmicos

| Requisito | Solução |
|---|---|
| Acesso ao BD via interface desenvolvida | Interface web React + API Express |
| Sem acesso por linha de comando ou pgAdmin | Todo CRUD é feito pela interface |
| Permitir inserção e consulta via interface | Formulários e tabelas/cards na UI |
| Sem ORM ou Query Builder | Apenas o driver `pg` (node-postgres) |
| SQL puro obrigatório | Todas as queries escritas manualmente nos repositórios |
| Bibliotecas de conexão permitidas | Somente `pg` para conexão com o banco |

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Banco de Dados | PostgreSQL 18 |
| Back-end | Node.js + TypeScript + Express |
| Driver de BD | `pg` (node-postgres) — SQL puro |
| Front-end | React + TypeScript + Vite |
| Estilização | CSS puro (sem frameworks) |

---

## 🗄️ Modelagem do Banco

O banco possui **8 tabelas** com relações 1:N e N:M devidamente tratadas:

```
classificacao_indicativa   desenvolvedora   distribuidora   plataforma   genero
         ↑                      ↑                ↑               ↑          ↑
         └──────────────────── jogos ────────────┘               │          │
                                  │                               │          │
                                  ├──── jogo_plataforma ──────────┘          │
                                  └──── jogo_genero ────────────────────────┘
```

### Tabelas principais
- **jogos** — título, duração média, categoria, datas e FKs para as demais tabelas
- **desenvolvedora** — nome, CNPJ, estúdio, diretor, país, data de fundação
- **distribuidora** — nome, CNPJ, país
- **plataforma** — nome, empresa fabricante
- **genero** — nome do gênero
- **classificacao_indicativa** — faixa etária (Livre, 10+, 12+, 14+, 16+, 18+)
- **jogo_genero** — tabela de junção N:M entre jogos e gêneros
- **jogo_plataforma** — tabela de junção N:M entre jogos e plataformas

---

## 📁 Estrutura do Projeto

```
lumos-catalog/
├── schema.sql                        ← DDL completo (CREATE TABLE, índices, seed base)
├── seed_100.sql                      ← 100 jogos para popular o banco
├── package.json
├── tsconfig.json
├── .env.example                      ← modelo de variáveis de ambiente
└── src/
    ├── server.ts                     ← servidor Express com todas as rotas
    ├── test.ts                       ← smoke-test de conexão
    ├── database/
    │   └── database.ts               ← pool de conexão via pg
    └── repositories/                 ← SQL puro — nenhum ORM
        ├── gameRepository.ts         ← CRUD de jogos (com transações)
        ├── developerRepository.ts    ← CRUD de desenvolvedoras
        ├── publisherRepository.ts    ← CRUD de distribuidoras
        ├── platformRepository.ts     ← CRUD de plataformas
        ├── genreRepository.ts        ← CRUD de gêneros
        └── ratingRepository.ts       ← listagem de classificações
└── client/                           ← front-end React
    ├── index.html
    ├── vite.config.ts
    └── src/
        ├── App.tsx                   ← rotas da aplicação
        ├── App.css                   ← estilos globais
        ├── main.tsx                  ← entry point
        ├── types/
        │   └── index.ts              ← interfaces TypeScript
        ├── services/
        │   ├── api.ts                ← chamadas HTTP ao back-end
        │   └── rawg.ts               ← busca de capas (RAWG API)
        ├── components/
        │   └── Navbar.tsx
        └── pages/
            ├── GamesPage.tsx         ← listagem com cards/tabela + busca + ordenação
            ├── GameFormPage.tsx      ← formulário de cadastro e edição
            ├── DevelopersPage.tsx    ← gerenciamento de desenvolvedoras
            └── PublishersPage.tsx    ← gerenciamento de distribuidoras
```

---

## 🚀 Como Rodar

### Pré-requisitos

- [Node.js LTS](https://nodejs.org)
- [PostgreSQL](https://www.postgresql.org/download/) instalado localmente

---

### Passo 1 — Criar o banco de dados

No **pgAdmin**: botão direito em **Databases → Create → Database**
Nome: `catalogo_jogos` → **Save**

---

### Passo 2 — Executar o schema

No pgAdmin com o banco `catalogo_jogos` selecionado:
1. **Tools → Query Tool**
2. Ícone de pasta → selecione o arquivo `schema.sql`
3. Pressione **F5**

---

### Passo 3 — Popular o banco (opcional)

Para inserir jogos de exemplo, repita o processo do Passo 2 com o arquivo `seed.sql`.

---

### Passo 4 — Configurar variáveis de ambiente

Na pasta raiz do projeto, crie o arquivo `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=catalogo_jogos
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
```

---

### Passo 5 — Instalar dependências

**Back-end** (na pasta raiz):
```bash
npm install
```

**Front-end** (na pasta client):
```bash
cd client
npm install
```

---

### Passo 6 — Iniciar o sistema

Abra **dois terminais**:

**Terminal 1 — Back-end:**
```bash
npm run dev
```
Saída esperada:
```
[DB] Conexão OK → banco: "catalogo_jogos"
[Server] API rodando em http://localhost:3000
```

**Terminal 2 — Front-end:**
```bash
cd client
npm run dev
```
Saída esperada:
```
VITE ready in ...ms
➜ Local: http://localhost:5173
```

Acesse **http://localhost:5173** no navegador.

---

## 🔗 Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/games` | Lista todos os jogos com JOINs |
| GET | `/api/games/:id` | Busca jogo por ID |
| POST | `/api/games` | Cadastra novo jogo |
| PUT | `/api/games/:id` | Atualiza jogo existente |
| DELETE | `/api/games/:id` | Remove jogo |
| GET | `/api/developers` | Lista desenvolvedoras |
| POST | `/api/developers` | Cadastra desenvolvedora |
| PUT | `/api/developers/:id` | Atualiza desenvolvedora |
| DELETE | `/api/developers/:id` | Remove desenvolvedora |
| GET | `/api/publishers` | Lista distribuidoras |
| POST | `/api/publishers` | Cadastra distribuidora |
| GET | `/api/platforms` | Lista plataformas |
| GET | `/api/genres` | Lista gêneros |
| GET | `/api/ratings` | Lista classificações indicativas |

---

## 👥 Equipe
Arthur Fernando Fernades Vasconcelos - 23.1.8072<br>
Arthur de Oliveira Formiga<br>
João Claudio Starling<br>


Projeto desenvolvido para as disciplinas CSI440 — UFOP
