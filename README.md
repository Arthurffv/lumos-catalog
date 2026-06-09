# Catálogo de Jogos — SBD Acadêmico

Sistema de Banco de Dados relacional para cadastro e consulta de jogos, desenvolvido com **PostgreSQL**, **Node.js**, **TypeScript** e **Express**. Toda comunicação com o banco é feita via **SQL puro** (raw SQL) usando o driver `pg`.

---

## Pré-requisitos

- [Node.js LTS](https://nodejs.org)
- [PostgreSQL](https://www.postgresql.org/download/) instalado localmente **ou** uma conta em [neon.tech](https://neon.tech) / [supabase.com](https://supabase.com)

---

## Como rodar (passo a passo)

### 1. Criar o banco de dados

No pgAdmin ou no terminal `psql`:
```sql
CREATE DATABASE catalogo_jogos;
```

### 2. Executar o schema

Abra o arquivo `schema.sql` no **Query Tool** do pgAdmin (com o banco `catalogo_jogos` selecionado) e clique em ▶ **Run**.

Isso cria todas as tabelas e insere os dados iniciais (classificações, gêneros e plataformas).

### 3. Configurar variáveis de ambiente

```bash
# Copie o modelo e preencha com suas credenciais
cp .env.example .env
```

Edite o `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=catalogo_jogos
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
```

### 4. Instalar dependências

```bash
npm install
```

### 5. Testar a conexão e o repositório

```bash
npm run test:db
```

Saída esperada:
```
[DB] Conexão OK → banco: "catalogo_jogos" | hora: ...
[GameRepository] Jogo inserido com sucesso. ID: 1
TODOS OS TESTES PASSARAM ✔
```

### 6. Iniciar o servidor (modo desenvolvimento)

```bash
npm run dev
```

---

## Estrutura do projeto

```
catalogo-jogos/
├── schema.sql                      ← DDL completo do banco
├── package.json
├── tsconfig.json
├── .env.example                    ← modelo de credenciais
└── src/
    ├── test.ts                     ← smoke-test rápido
    ├── server.ts                   ← entrada do servidor Express
    ├── database/
    │   └── database.ts             ← pool de conexão (pg)
    └── repositories/
        └── gameRepository.ts       ← SQL puro: insert, list, getById
```

---

## Stack

| Camada      | Tecnologia                    |
|-------------|-------------------------------|
| Banco       | PostgreSQL                    |
| Back-end    | Node.js + TypeScript + Express|
| Driver DB   | `pg` (node-postgres) — raw SQL|
| Front-end   | React + TypeScript (em breve) |
