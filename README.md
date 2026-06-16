# Multitenant Platform

Monorepo do MVP da plataforma SaaS multi-tenant com autenticação, onboarding, administração de tenant e cadastro de pessoas.

## Arquitetura

- **`apps/api`** — API NestJS (TypeORM + PostgreSQL, JWT, refresh token rotativo)
- **`apps/backoffice`** — Backoffice Angular 17 com PO-UI
- **`apps/portal`** — Portal externo Angular 17 com PO-UI
- **`packages/contracts`** — Contratos e DTOs compartilhados
- **`packages/shared`** — Utilitários compartilhados

## Setup Rápido

```bash
# 1. Instalar dependências
pnpm install

# 2. Subir PostgreSQL
docker compose up -d

# 3. Rodar migrations
pnpm --filter api migration:run

# 4. Iniciar API
pnpm dev:api

# 5. Criar primeiro tenant
curl -X POST http://localhost:3000/onboarding/tenants \
  -H "Content-Type: application/json" \
  -d '{"slug":"demo","displayName":"Demo","adminEmail":"admin@demo.local","adminPassword":"Mudar@123"}'
```

Ver [docs/runbooks/local-setup.md](docs/runbooks/local-setup.md) para setup completo.

## Testes

```bash
pnpm --filter api test:e2e
```

15 testes e2e cobrindo: health, database, auth, tenant context, onboarding, people-metadata, people CRUD, duplicate check, portal update requests, e auditoria.

## Documentação

- [Setup local](docs/runbooks/local-setup.md)
- [Endpoints de pessoas](docs/api/people-endpoints.md)

## Critérios de aceite implementados

- ✅ Criar tenant por onboarding com administrador inicial
- ✅ Login com sessão JWT e refresh rotativo
- ✅ Resolver tenant ativo e papéis por request
- ✅ Configurar política do cadastro de pessoas por tenant
- ✅ Criar e listar pessoas com `internal_code` automático
- ✅ Detectar duplicidade conforme política do tenant (alert/block)
- ✅ Permitir solicitação externa de atualização cadastral
- ✅ Auditar eventos principais do fluxo
