# MVP Multi-tenant Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Construir a primeira entrega executável da plataforma SaaS multi-tenant com autenticação, onboarding básico, administração de tenant e cadastro de pessoas.

**Architecture:** A implementação será feita como monorepo novo com `apps/backoffice`, `apps/portal` e `apps/api`, compartilhando contratos e utilitários. O backend em `NestJS` concentra tenant context, autenticação, autorização, metadata e domínio de pessoas; os frontends Angular com `PO-UI` consomem a mesma API com experiências separadas por canal.

**Tech Stack:** Angular, PO-UI, NestJS, PostgreSQL, TypeORM ou Prisma, JWT, refresh token rotativo, armazenamento externo de arquivos, Docker Compose, pnpm workspace

---

## Premissas do plano

- Este repositório ainda não contém a aplicação do produto; o plano assume criação de nova estrutura.
- O package manager assumido é `pnpm`.
- O banco local de desenvolvimento será `PostgreSQL` via `docker-compose`.
- O MVP não implementa módulos além de autenticação, onboarding inicial e cadastro de pessoas.

### Task 1: Estruturar o monorepo do produto

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `apps/api/package.json`
- Create: `apps/backoffice/package.json`
- Create: `apps/portal/package.json`
- Create: `packages/contracts/package.json`
- Create: `packages/shared/package.json`
- Create: `docker-compose.yml`
- Create: `README.md`

**Step 1: Criar o workspace base**

Criar `pnpm-workspace.yaml` com:

```yaml
packages:
  - apps/*
  - packages/*
```

Criar `package.json` raiz com:

```json
{
  "name": "multitenant-platform",
  "private": true,
  "packageManager": "pnpm@10.0.0",
  "scripts": {
    "dev:api": "pnpm --filter api start:dev",
    "dev:backoffice": "pnpm --filter backoffice start",
    "dev:portal": "pnpm --filter portal start",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test"
  }
}
```

**Step 2: Subir infraestrutura local**

Criar `docker-compose.yml` com PostgreSQL:

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: multitenant
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
    ports:
      - "5432:5432"
```

**Step 3: Validar bootstrap**

Run: `pnpm install`
Expected: workspace instalado sem erro

**Step 4: Commit**

```bash
git add pnpm-workspace.yaml package.json tsconfig.base.json apps packages docker-compose.yml README.md
git commit -m "chore: bootstrap monorepo structure"
```

### Task 2: Criar a API NestJS com healthcheck e config

**Files:**
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/health/health.controller.ts`
- Create: `apps/api/src/config/env.schema.ts`
- Create: `apps/api/test/health.e2e-spec.ts`

**Step 1: Escrever o teste de healthcheck**

Criar `apps/api/test/health.e2e-spec.ts`:

```ts
it('/health returns ok', async () => {
  const response = await request(app.getHttpServer()).get('/health');
  expect(response.status).toBe(200);
  expect(response.body).toEqual({ status: 'ok' });
});
```

**Step 2: Rodar o teste e confirmar falha**

Run: `pnpm --filter api test:e2e -- health`
Expected: FAIL porque app e rota ainda não existem

**Step 3: Implementar o mínimo**

Criar `health.controller.ts`:

```ts
@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return { status: 'ok' };
  }
}
```

**Step 4: Rodar o teste e confirmar sucesso**

Run: `pnpm --filter api test:e2e -- health`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api
git commit -m "feat: add api bootstrap and healthcheck"
```

### Task 3: Implantar persistência e primeira migration

**Files:**
- Create: `apps/api/src/database/database.module.ts`
- Create: `apps/api/src/database/database.config.ts`
- Create: `apps/api/src/database/migrations/0001-initial-platform.ts`
- Create: `apps/api/test/database.e2e-spec.ts`

**Step 1: Escrever teste de conexão**

Criar `apps/api/test/database.e2e-spec.ts`:

```ts
it('database connection initializes', async () => {
  const dataSource = app.get(DataSource);
  expect(dataSource.isInitialized).toBe(true);
});
```

**Step 2: Rodar teste e validar falha**

Run: `pnpm --filter api test:e2e -- database`
Expected: FAIL por ausência de configuração do datasource

**Step 3: Implementar conexão e migration inicial**

A migration `0001-initial-platform.ts` deve criar:

- `tenant`
- `plan`
- `feature`
- `plan_feature`
- `tenant_plan`
- `tenant_feature_override`
- `tenant_onboarding`
- `platform_identity`

**Step 4: Rodar migration e testes**

Run: `pnpm --filter api migration:run`
Run: `pnpm --filter api test:e2e -- database`
Expected: migrations aplicadas e teste PASS

**Step 5: Commit**

```bash
git add apps/api/src/database apps/api/test
git commit -m "feat: add database module and initial platform schema"
```

### Task 4: Implementar autenticação base e sessão

**Files:**
- Create: `apps/api/src/auth/auth.module.ts`
- Create: `apps/api/src/auth/auth.controller.ts`
- Create: `apps/api/src/auth/auth.service.ts`
- Create: `apps/api/src/auth/jwt-access.strategy.ts`
- Create: `apps/api/src/auth/jwt-refresh.strategy.ts`
- Create: `apps/api/src/auth/entities/auth-session.entity.ts`
- Create: `apps/api/src/auth/entities/auth-refresh-token.entity.ts`
- Create: `apps/api/test/auth-login.e2e-spec.ts`

**Step 1: Escrever teste de login**

Criar `apps/api/test/auth-login.e2e-spec.ts`:

```ts
it('returns access and refresh token on valid login', async () => {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ login: 'admin@demo.local', password: 'Secret123!' });

  expect(response.status).toBe(201);
  expect(response.body.accessToken).toBeDefined();
  expect(response.body.refreshToken).toBeDefined();
});
```

**Step 2: Rodar teste e validar falha**

Run: `pnpm --filter api test:e2e -- auth-login`
Expected: FAIL porque autenticação ainda não existe

**Step 3: Implementar fluxo mínimo**

Implementar:

- validação de `platform_identity`
- geração de `auth_session`
- emissão de JWT curto
- emissão de refresh token rotativo

Resposta mínima:

```json
{
  "accessToken": "jwt",
  "refreshToken": "opaque-token",
  "expiresIn": 900
}
```

**Step 4: Testar refresh**

Adicionar teste:

```ts
it('rotates refresh token', async () => {
  expect(response.body.refreshToken).not.toEqual(second.body.refreshToken);
});
```

Run: `pnpm --filter api test:e2e -- auth`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/auth apps/api/test/auth-login.e2e-spec.ts
git commit -m "feat: add auth login and rotating refresh sessions"
```

### Task 5: Implementar tenant context, roles e guards

**Files:**
- Create: `apps/api/src/tenancy/tenant-context.guard.ts`
- Create: `apps/api/src/tenancy/tenant-context.decorator.ts`
- Create: `apps/api/src/authorization/roles.guard.ts`
- Create: `apps/api/src/authorization/scopes.guard.ts`
- Create: `apps/api/src/authorization/entities/tenant-user.entity.ts`
- Create: `apps/api/src/authorization/entities/tenant-role.entity.ts`
- Create: `apps/api/test/tenant-context.e2e-spec.ts`

**Step 1: Escrever teste de acesso protegido**

```ts
it('rejects request without tenant context', async () => {
  const response = await request(app.getHttpServer()).get('/people');
  expect(response.status).toBe(401);
});
```

**Step 2: Rodar teste e validar falha**

Run: `pnpm --filter api test:e2e -- tenant-context`
Expected: FAIL porque guardas ainda não existem

**Step 3: Implementar resolução de contexto**

Regras mínimas:

- resolver `tenant_id` a partir da sessão
- resolver `tenant_user_id`
- resolver `channel`
- anexar contexto ao request

**Step 4: Cobrir autorização**

Adicionar teste:

```ts
it('forbids user without role permission', async () => {
  expect(response.status).toBe(403);
});
```

Run: `pnpm --filter api test:e2e -- tenant-context`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/tenancy apps/api/src/authorization apps/api/test/tenant-context.e2e-spec.ts
git commit -m "feat: add tenant context and authorization guards"
```

### Task 6: Implementar onboarding e configuração inicial do tenant

**Files:**
- Create: `apps/api/src/onboarding/onboarding.module.ts`
- Create: `apps/api/src/onboarding/onboarding.controller.ts`
- Create: `apps/api/src/onboarding/onboarding.service.ts`
- Create: `apps/api/src/tenant-settings/entities/tenant-branding.entity.ts`
- Create: `apps/api/src/tenant-settings/entities/tenant-person-policy.entity.ts`
- Create: `apps/api/test/onboarding.e2e-spec.ts`

**Step 1: Escrever teste de criação de tenant**

```ts
it('creates tenant with initial branding and person policy', async () => {
  const response = await request(app.getHttpServer())
    .post('/onboarding/tenants')
    .send({ slug: 'demo', displayName: 'Demo', adminEmail: 'admin@demo.local' });

  expect(response.status).toBe(201);
  expect(response.body.tenant.slug).toBe('demo');
});
```

**Step 2: Rodar teste e validar falha**

Run: `pnpm --filter api test:e2e -- onboarding`
Expected: FAIL porque fluxo ainda não existe

**Step 3: Implementar o mínimo**

O serviço deve criar em transação:

- `tenant`
- `tenant_onboarding`
- `tenant_branding`
- `tenant_person_policy`
- `tenant_user`
- vínculo inicial de administrador

**Step 4: Rodar testes**

Run: `pnpm --filter api test:e2e -- onboarding`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/onboarding apps/api/src/tenant-settings apps/api/test/onboarding.e2e-spec.ts
git commit -m "feat: add tenant onboarding bootstrap"
```

### Task 7: Implementar metadata configurável do cadastro de pessoas

**Files:**
- Create: `apps/api/src/people-metadata/people-metadata.module.ts`
- Create: `apps/api/src/people-metadata/people-metadata.controller.ts`
- Create: `apps/api/src/people-metadata/entities/tenant-person-document-type.entity.ts`
- Create: `apps/api/src/people-metadata/entities/tenant-person-context-code-type.entity.ts`
- Create: `apps/api/src/people-metadata/entities/tenant-field-rule.entity.ts`
- Create: `apps/api/test/people-metadata.e2e-spec.ts`

**Step 1: Escrever teste de leitura da policy**

```ts
it('returns tenant person metadata', async () => {
  const response = await request(app.getHttpServer()).get('/people-metadata');
  expect(response.status).toBe(200);
  expect(response.body.documentTypes).toBeInstanceOf(Array);
});
```

**Step 2: Rodar teste e validar falha**

Run: `pnpm --filter api test:e2e -- people-metadata`
Expected: FAIL

**Step 3: Implementar leitura e atualização**

Endpoints mínimos:

- `GET /people-metadata`
- `PUT /people-metadata/policy`
- `PUT /people-metadata/document-types`
- `PUT /people-metadata/context-code-types`

**Step 4: Rodar testes**

Run: `pnpm --filter api test:e2e -- people-metadata`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/people-metadata apps/api/test/people-metadata.e2e-spec.ts
git commit -m "feat: add tenant metadata for people module"
```

### Task 8: Implementar CRUD de pessoas

**Files:**
- Create: `apps/api/src/people/people.module.ts`
- Create: `apps/api/src/people/people.controller.ts`
- Create: `apps/api/src/people/people.service.ts`
- Create: `apps/api/src/people/entities/person.entity.ts`
- Create: `apps/api/src/people/entities/person-contact.entity.ts`
- Create: `apps/api/src/people/entities/person-document.entity.ts`
- Create: `apps/api/test/people-create.e2e-spec.ts`

**Step 1: Escrever teste de criação rápida**

```ts
it('creates person with generated internal code', async () => {
  const response = await request(app.getHttpServer())
    .post('/people')
    .send({ nameLegal: 'Maria Silva' });

  expect(response.status).toBe(201);
  expect(response.body.internalCode).toBeDefined();
});
```

**Step 2: Rodar teste e validar falha**

Run: `pnpm --filter api test:e2e -- people-create`
Expected: FAIL

**Step 3: Implementar criação mínima**

Regras:

- gerar `internal_code`
- aplicar obrigatoriedade configurável do tenant
- persistir auditoria
- devolver payload resumido

**Step 4: Cobrir listagem e detalhe**

Adicionar testes:

```ts
it('lists people filtered by tenant', async () => {
  expect(response.body.items.length).toBe(1);
});
```

Run: `pnpm --filter api test:e2e -- people`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/people apps/api/test/people-create.e2e-spec.ts
git commit -m "feat: add tenant people crud"
```

### Task 9: Implementar duplicidade, códigos por contexto e solicitações externas

**Files:**
- Create: `apps/api/src/people/duplicate-check.service.ts`
- Create: `apps/api/src/people/entities/person-context-code.entity.ts`
- Create: `apps/api/src/people-requests/people-requests.module.ts`
- Create: `apps/api/src/people-requests/people-requests.controller.ts`
- Create: `apps/api/src/people-requests/entities/person-update-request.entity.ts`
- Create: `apps/api/test/people-duplicate.e2e-spec.ts`
- Create: `apps/api/test/portal-update-request.e2e-spec.ts`

**Step 1: Escrever teste de duplicidade**

```ts
it('blocks duplicate person when tenant policy is block', async () => {
  expect(response.status).toBe(409);
});
```

**Step 2: Rodar teste e validar falha**

Run: `pnpm --filter api test:e2e -- people-duplicate`
Expected: FAIL

**Step 3: Implementar regras mínimas**

Implementar:

- comparação por critérios configurados
- modo `alert` e modo `block`
- cadastro de `person_context_code`

**Step 4: Implementar solicitação externa**

Teste:

```ts
it('portal user creates person update request', async () => {
  expect(response.status).toBe(201);
});
```

Run: `pnpm --filter api test:e2e -- portal-update-request`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/people-requests apps/api/src/people apps/api/test/people-duplicate.e2e-spec.ts apps/api/test/portal-update-request.e2e-spec.ts
git commit -m "feat: add duplicate policy and portal update requests"
```

### Task 10: Implementar backoffice Angular com login, tenant e pessoas

**Files:**
- Create: `apps/backoffice/src/app/app.routes.ts`
- Create: `apps/backoffice/src/app/core/auth/auth.service.ts`
- Create: `apps/backoffice/src/app/core/tenant/tenant-context.service.ts`
- Create: `apps/backoffice/src/app/features/login/login.component.ts`
- Create: `apps/backoffice/src/app/features/people/people-list.component.ts`
- Create: `apps/backoffice/src/app/features/people/people-form.component.ts`
- Create: `apps/backoffice/src/app/features/onboarding/onboarding.component.ts`
- Test: `apps/backoffice/src/app/features/people/people-list.component.spec.ts`

**Step 1: Escrever teste de tela de listagem**

```ts
it('renders returned people in po-table', async () => {
  expect(component.items.length).toBe(2);
});
```

**Step 2: Rodar teste e validar falha**

Run: `pnpm --filter backoffice test -- people-list`
Expected: FAIL

**Step 3: Implementar shell mínimo**

Entregas mínimas:

- login
- seleção de tenant
- layout com `PO-UI`
- listagem de pessoas
- criação rápida
- tela de onboarding administrativo

**Step 4: Rodar testes**

Run: `pnpm --filter backoffice test`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/backoffice
git commit -m "feat: add backoffice shell and people screens"
```

### Task 11: Implementar portal externo Angular

**Files:**
- Create: `apps/portal/src/app/app.routes.ts`
- Create: `apps/portal/src/app/core/auth/portal-auth.service.ts`
- Create: `apps/portal/src/app/features/login/login.component.ts`
- Create: `apps/portal/src/app/features/person/person-view.component.ts`
- Create: `apps/portal/src/app/features/person/person-update-request.component.ts`
- Test: `apps/portal/src/app/features/person/person-update-request.component.spec.ts`

**Step 1: Escrever teste da solicitação**

```ts
it('submits update request form', async () => {
  expect(api.createRequest).toHaveBeenCalled();
});
```

**Step 2: Rodar teste e validar falha**

Run: `pnpm --filter portal test -- person-update-request`
Expected: FAIL

**Step 3: Implementar o mínimo**

Entregas mínimas:

- login do portal
- visualização da pessoa autorizada
- formulário de solicitação de atualização

**Step 4: Rodar testes**

Run: `pnpm --filter portal test`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/portal
git commit -m "feat: add portal login and person update request flow"
```

### Task 12: Observabilidade, docs e hardening do MVP

**Files:**
- Create: `apps/api/src/audit/audit.module.ts`
- Create: `apps/api/src/audit/audit.interceptor.ts`
- Create: `apps/api/src/common/filters/http-exception.filter.ts`
- Create: `docs/api/people-endpoints.md`
- Create: `docs/runbooks/local-setup.md`
- Modify: `README.md`

**Step 1: Escrever teste de auditoria**

```ts
it('stores audit event after person creation', async () => {
  expect(auditEvent.action).toBe('person.create');
});
```

**Step 2: Rodar teste e validar falha**

Run: `pnpm --filter api test:e2e -- audit`
Expected: FAIL

**Step 3: Implementar hardening mínimo**

Implementar:

- interceptador de auditoria
- filtro HTTP padronizado
- documentação de setup local
- documentação dos endpoints do MVP

**Step 4: Rodar validação final**

Run: `pnpm lint`
Run: `pnpm test`
Expected: tudo PASS

**Step 5: Commit**

```bash
git add apps/api/src/audit apps/api/src/common docs README.md
git commit -m "chore: add audit, docs and mvp hardening"
```

## Ordem recomendada de execução

1. Bootstrap e infraestrutura
2. API base e banco
3. Autenticação e tenant context
4. Onboarding e metadata
5. Cadastro de pessoas
6. Portal externo
7. Auditoria e hardening

## Riscos principais

- Misturar autenticação com autorização cedo demais
- Subestimar o impacto do `tenant_id` nas queries e índices
- Hardcodar metadata de pessoas no backend ou frontend
- Acoplar portal e backoffice em permissões únicas
- Adiar auditoria até tarde demais

## Critérios mínimos de aceite do MVP

- Criar tenant por onboarding e ativar administrador inicial
- Login com sessão e refresh rotativo
- Resolver tenant ativo e papéis por request
- Configurar política básica do cadastro de pessoas por tenant
- Criar e listar pessoas com `internal_code` automático
- Detectar duplicidade conforme política do tenant
- Permitir solicitação externa de atualização cadastral
- Auditar eventos principais do fluxo
