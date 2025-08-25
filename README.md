# Diário de Bordo – Monorepo

Monorepo com Web (React + Vite) e API (Express + Prisma) em TypeScript, com tipos compartilhados.

## Estrutura
- apps/web: Frontend React + Vite + MUI
- apps/api: Backend Express + Prisma (SQLite dev)
- packages/types: Tipos compartilhados (@diario/types)

## Início rápido
1. Instalar dependências na raiz (workspaces):
   - npm install
2. Gerar Prisma Client e migrar DB (dev):
   - npm run -w apps/api prisma:generate
   - npm run -w apps/api prisma:migrate
3. Rodar API e Web em terminais separados:
   - npm run dev:api
   - npm run dev:web

A Web proxyará /api para http://localhost:3000.