# Setup Local — MVP Multi-tenant

## Pré-requisitos

- Node.js 20+
- pnpm 10+
- Docker e Docker Compose

## 1. Clonar e instalar

```bash
git clone <repo-url>
cd sistema
pnpm install
```

## 2. Subir infraestrutura

```bash
docker compose up -d
```

Aguardar PostgreSQL subir na porta 5432.

## 3. Rodar migrations

```bash
pnpm --filter api migration:run
```

## 4. Iniciar a API

```bash
pnpm dev:api
```

API disponível em `http://localhost:3000`.

## 5. Criar primeiro tenant

```bash
curl -X POST http://localhost:3000/onboarding/tenants \
  -H "Content-Type: application/json" \
  -d '{"slug":"demo","displayName":"Demo","adminEmail":"admin@demo.local","adminPassword":"Mudar@123"}'
```

## 6. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin@demo.local","password":"Mudar@123"}'
```

## 7. Rodar testes

```bash
pnpm --filter api test:e2e
```

## Variáveis de ambiente (opcional)

Criar `apps/api/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=app
DB_PASS=app
DB_NAME=multitenant
JWT_SECRET=meu-segredo-super-seguro
JWT_REFRESH_SECRET=meu-segredo-refresh
```
