<div align="center">

# 📓 Diário de Bordo

Monorepo TypeScript com Frontend (React + Vite) e Backend (Express + Prisma), usando tipos compartilhados.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=222)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

</div>

## Visão geral
- apps/web: React + Vite + MUI (Material UI)
- apps/api: Express + Prisma (SQLite em dev) servindo em `/api`
- packages/types: Tipos TypeScript compartilhados (`@diario/types`)

## 🗂️ Estrutura

```
apps/
   api/               # API Express + Prisma
      prisma/          # Schema e migrations (SQLite em dev)
      src/             # App, rotas e controllers
      uploads/         # Arquivos enviados (static)
   web/               # Frontend React + Vite + MUI
packages/
   types/             # Tipos compartilhados
```

## 🚀 Início rápido
Pré-requisitos: Node 18+ e npm 9+.

1) Instalar dependências (na raiz):
- npm install

2) Configurar variáveis de ambiente (na raiz):
- Copie `.env.example` para `.env` e ajuste se necessário.

3) Preparar o banco (dev):
- npm run -w apps/api prisma:generate
- npm run -w apps/api prisma:migrate

4) Rodar em desenvolvimento (dois terminais):
- npm run dev:api  → API em http://localhost:3000
- npm run dev:web  → Web em http://localhost:5173

Observação: o Vite faz proxy de `/api` para `http://localhost:3000` em dev.

## ⚙️ Variáveis de ambiente
Crie um arquivo `.env` na raiz do monorepo (um `.env.example` está incluído):

```
# Porta da API Express
PORT=3000

# SQLite – caminho relativo à RAIZ do repositório
DATABASE_URL="file:./apps/api/prisma/dev.db"

# Pasta de uploads (caminho relativo à RAIZ)
UPLOAD_DIR=./apps/api/uploads
```

- A API expõe os arquivos estáticos em `/uploads` e também via rotas `/api/files/:id`.
- Em dev, o Prisma usa o SQLite no arquivo indicado por `DATABASE_URL`.

## 📦 Scripts principais
Na raiz (workspaces):

- build: build de todos os pacotes
- dev: atalho para `apps/web`
- dev:api: roda API em watch (tsx)
- dev:web: roda Web (Vite)
- typecheck: checagem TypeScript em todos pacotes

Na API (`apps/api`):

- dev: `tsx watch src/server.ts`
- prisma:generate, prisma:migrate, prisma:studio
- build/start/typecheck

Na Web (`apps/web`):

- dev/build/preview/typecheck

## 🧭 Endpoints da API (base: `/api`)

- GET `/health` → { ok, ts }

### Conversas `/conversations`
- GET `/` → Lista conversas (ordenadas por `updatedAt desc`)
- POST `/` body: `{ title?: string }` → Cria conversa
- GET `/:id` → Obtém conversa
- PATCH `/:id` body: `{ title: string }` → Atualiza título
- DELETE `/:id` → Exclui conversa e seus dados relacionados

### Mensagens `/messages`
- GET `/by-conversation/:conversationId` → Lista mensagens de uma conversa
- POST `/` body: `{ conversationId, role, content, type, fileIds? }` → Envia mensagem

### Arquivos `/files`
- GET `/by-conversation/:conversationId` → Lista arquivos de uma conversa
- POST `/upload` (multipart/form-data)
   - campo: `file` (arquivo)
   - campos extras: `conversationId`
   - retorno: `{ file, message }`
- GET `/:id` → Stream do arquivo (headers inline/download)
   - query `?download=1` para forçar download
- GET `/:id/meta` → Metadados do arquivo

## 🧱 Modelo de dados (Prisma)
- Conversation 1—N Message
- Conversation 1—N File
- Message 1—N File (relacionamento via `messageId`)
- Conversation 1—N ConversationSummary

SQLite em desenvolvimento (arquivo `apps/api/prisma/dev.db`).

## 🔗 Tipos compartilhados (`@diario/types`)
Interfaces principais expostas:
- `Conversation`, `Message`, `FileMeta`, `ConversationSummary`
- DTOs: `CreateConversationDTO`, `UpdateConversationDTO`, `SendMessageDTO`, `CreateFileDTO`

Importe no front/back:

```ts
import type { Message, CreateConversationDTO } from '@diario/types';
```

## 🛠️ Dicas & Troubleshooting
- Porta ocupada: ajuste `PORT` no `.env` (e o proxy do Vite se necessário).
- Reset do banco (dev): apague `dev.db` e rode migrations novamente.
- Uploads: garanta que `UPLOAD_DIR` existe; a API cria se faltar.
- CORS: já habilitado por padrão na API.

## 📅 Roadmap (ideias)
- Autenticação/Autorização
- Paginação e filtros nas listas
- Testes automatizados (API e Web)
- Deploy (Docker, CI/CD)

---

Feito com ❤️ em TypeScript.