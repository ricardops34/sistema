# Governanca Administrativa Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Implementar o modulo administrativo complementar da plataforma para governanca de tenant, usuarios, perfis, catalogo global, menu e features.

**Architecture:** A implementacao deve reaproveitar o backend NestJS atual, o modelo relacional de acesso ja iniciado e o contexto de tenant existente. O escopo deve ser dividido entre APIs de `tenant admin` e APIs globais de `Super Admin`, sempre com autorizacao relacional, auditoria e politica de inativacao.

**Tech Stack:** NestJS, TypeORM, PostgreSQL, Angular, PO-UI, Jest e2e, JWT, auditoria existente do produto

---

## Premissas

- o onboarding, o catalogo funcional global e a resolucao relacional de acesso ja existem em estado inicial
- `Super Admin` e uma governanca global separada do tenant
- o tenant pode manter seus usuarios, mas nao define estrutura de perfil, grants ou catalogo global
- a regra final de auto-habilitacao de `features` pelo tenant ainda esta pendente e deve ficar configuravel

### Task 1: Consolidar o modelo fisico administrativo

**Files:**
- Create: `apps/api/src/database/migrations/0013-admin-governance-hardening.ts`
- Modify: `apps/api/src/database/migrations/0011-access-catalog.ts`
- Modify: `apps/api/src/database/migrations/0012-access-governance.ts`
- Test: `apps/api/test/admin-governance-schema.e2e-spec.ts`

**Step 1: Write the failing test**

```ts
it('stores assignable, locked and visibility flags required by admin governance', async () => {
  const profileColumns = await dataSource.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'tenant_profile'
  `);
  expect(profileColumns.map((item) => item.column_name)).toContain('is_assignable_by_tenant');
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter api test:e2e -- admin-governance-schema.e2e-spec.ts --runInBand`
Expected: FAIL por colunas e restricoes ausentes

**Step 3: Write minimal implementation**

Adicionar o minimo necessario ao modelo:

- `tenant_profile.is_assignable_by_tenant`
- `tenant_user_profile.granted_by_type`
- `tenant_user_profile.is_locked_by_platform`
- `app_routine.is_visible_in_menu`
- `app_module`, `app_menu_group` e `app_routine` com campos de ordenacao e icone coerentes

**Step 4: Run test to verify it passes**

Run: `pnpm --filter api migration:run`
Run: `pnpm --filter api test:e2e -- admin-governance-schema.e2e-spec.ts --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/database/migrations apps/api/test/admin-governance-schema.e2e-spec.ts
git commit -m "feat: harden admin governance schema"
```

### Task 2: Expor consulta de permissoes resolvidas e menu do usuario

**Files:**
- Create: `apps/api/src/me/me.module.ts`
- Create: `apps/api/src/me/me.controller.ts`
- Create: `apps/api/src/me/me.service.ts`
- Test: `apps/api/test/menu.e2e-spec.ts`

**Step 1: Write the failing test**

```ts
it('returns filtered menu tree for authenticated user', async () => {
  expect(response.body.modules[0].code).toBe('cadastro');
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter api test:e2e -- menu.e2e-spec.ts --runInBand`
Expected: FAIL por endpoint inexistente

**Step 3: Write minimal implementation**

Criar:

- `GET /me/menu`
- `GET /me/permissions`

Montar a arvore a partir de:

- catalogo global ativo
- rotinas visiveis em menu
- acessos resolvidos do usuario

**Step 4: Run test to verify it passes**

Run: `pnpm --filter api test:e2e -- menu.e2e-spec.ts --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/me apps/api/test/menu.e2e-spec.ts
git commit -m "feat: add resolved menu and permissions api"
```

### Task 3: Implementar CRUD administrativo de usuarios do tenant

**Files:**
- Create: `apps/api/src/tenant-admin/tenant-admin.module.ts`
- Create: `apps/api/src/tenant-admin/tenant-users.controller.ts`
- Create: `apps/api/src/tenant-admin/tenant-users.service.ts`
- Create: `apps/api/src/tenant-admin/dto/*.ts`
- Test: `apps/api/test/tenant-users.e2e-spec.ts`

**Step 1: Write the failing test**

```ts
it('creates, blocks, unblocks and resets password for a tenant user', async () => {
  expect(create.status).toBe(201);
  expect(block.status).toBe(200);
  expect(unblock.status).toBe(200);
  expect(reset.status).toBe(200);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter api test:e2e -- tenant-users.e2e-spec.ts --runInBand`
Expected: FAIL por endpoints inexistentes

**Step 3: Write minimal implementation**

Criar endpoints:

- `GET /tenant-admin/users`
- `POST /tenant-admin/users`
- `PUT /tenant-admin/users/:id`
- `PUT /tenant-admin/users/:id/block`
- `PUT /tenant-admin/users/:id/unblock`
- `PUT /tenant-admin/users/:id/inactivate`
- `PUT /tenant-admin/users/:id/activate`
- `PUT /tenant-admin/users/:id/reset-password`

Validar:

- sem exclusao fisica
- impedir auto-bloqueio e auto-inativacao
- impedir perda do ultimo perfil ativo em operacoes que afetem acesso

**Step 4: Run test to verify it passes**

Run: `pnpm --filter api test:e2e -- tenant-users.e2e-spec.ts --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/tenant-admin apps/api/test/tenant-users.e2e-spec.ts
git commit -m "feat: add tenant user administration"
```

### Task 4: Implementar atribuicao de perfis pelo tenant

**Files:**
- Create: `apps/api/src/tenant-admin/tenant-user-profiles.controller.ts`
- Modify: `apps/api/src/tenant-admin/tenant-users.service.ts`
- Test: `apps/api/test/tenant-user-profiles.e2e-spec.ts`

**Step 1: Write the failing test**

```ts
it('assigns only tenant-assignable profiles and blocks removal of the last active profile', async () => {
  expect(assign.status).toBe(200);
  expect(removeLast.status).toBe(409);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter api test:e2e -- tenant-user-profiles.e2e-spec.ts --runInBand`
Expected: FAIL por endpoint ou regra inexistente

**Step 3: Write minimal implementation**

Criar endpoints:

- `GET /tenant-admin/users/:id/profiles`
- `PUT /tenant-admin/users/:id/profiles`

Aplicar regras:

- so perfis `ativos` e `is_assignable_by_tenant = true`
- nao permitir perfil `Super Admin`
- nao exibir nem remover vinculos `is_locked_by_platform = true`
- nao remover ultimo perfil ativo do usuario

**Step 4: Run test to verify it passes**

Run: `pnpm --filter api test:e2e -- tenant-user-profiles.e2e-spec.ts --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/tenant-admin apps/api/test/tenant-user-profiles.e2e-spec.ts
git commit -m "feat: add tenant profile assignment controls"
```

### Task 5: Implementar CRUD do proprio tenant

**Files:**
- Create: `apps/api/src/tenant-admin/tenant-settings.controller.ts`
- Modify: `apps/api/src/tenant-admin/tenant-admin.module.ts`
- Modify: `apps/api/src/onboarding/dto/create-tenant.dto.ts`
- Test: `apps/api/test/tenant-settings.e2e-spec.ts`

**Step 1: Write the failing test**

```ts
it('updates tenant display data, plan, limits and enabled features but forbids slug change and self-inactivation', async () => {
  expect(update.status).toBe(200);
  expect(slugChange.status).toBe(400);
  expect(inactivate.status).toBe(403);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter api test:e2e -- tenant-settings.e2e-spec.ts --runInBand`
Expected: FAIL por endpoint ou validacao inexistente

**Step 3: Write minimal implementation**

Criar endpoints:

- `GET /tenant-admin/tenant`
- `PUT /tenant-admin/tenant`

Permitir:

- `displayName`
- `plan`
- `limits`
- `enabledFeatures`

Proibir:

- alteracao de `slug`
- auto-inativacao
- auto-exclusao

**Step 4: Run test to verify it passes**

Run: `pnpm --filter api test:e2e -- tenant-settings.e2e-spec.ts --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/tenant-admin apps/api/test/tenant-settings.e2e-spec.ts
git commit -m "feat: add tenant self-management api"
```

### Task 6: Implementar administracao global de perfis, grants e overrides

**Files:**
- Create: `apps/api/src/super-admin/super-admin.module.ts`
- Create: `apps/api/src/super-admin/super-admin-profiles.controller.ts`
- Create: `apps/api/src/super-admin/super-admin-profiles.service.ts`
- Test: `apps/api/test/admin-profiles.e2e-spec.ts`

**Step 1: Write the failing test**

```ts
it('creates a profile, marks assignability, updates routine grants and locks protected profile assignment', async () => {
  expect(create.status).toBe(201);
  expect(lock.status).toBe(200);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter api test:e2e -- admin-profiles.e2e-spec.ts --runInBand`
Expected: FAIL

**Step 3: Write minimal implementation**

Criar endpoints:

- `GET /super-admin/profiles`
- `POST /super-admin/profiles`
- `PUT /super-admin/profiles/:id`
- `PUT /super-admin/profiles/:id/routines`
- `PUT /super-admin/profiles/:id/actions`
- `PUT /super-admin/users/:id/profiles`
- `PUT /super-admin/users/:id/overrides`

Incluir controle de:

- `is_assignable_by_tenant`
- vinculo protegido por plataforma
- bloqueio automatico ao perder ultimo perfil ativo

**Step 4: Run test to verify it passes**

Run: `pnpm --filter api test:e2e -- admin-profiles.e2e-spec.ts --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/super-admin apps/api/test/admin-profiles.e2e-spec.ts
git commit -m "feat: add super admin profile governance"
```

### Task 7: Implementar CRUD global do catalogo funcional e menu

**Files:**
- Create: `apps/api/src/super-admin/super-admin-catalog.controller.ts`
- Create: `apps/api/src/super-admin/super-admin-catalog.service.ts`
- Test: `apps/api/test/super-admin-catalog.e2e-spec.ts`

**Step 1: Write the failing test**

```ts
it('creates, reorders and inactivates modules, groups, routines and routine actions with immediate effect', async () => {
  expect(createModule.status).toBe(201);
  expect(reorderRoutine.status).toBe(200);
  expect(inactivateRoutine.status).toBe(200);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter api test:e2e -- super-admin-catalog.e2e-spec.ts --runInBand`
Expected: FAIL

**Step 3: Write minimal implementation**

Criar endpoints globais:

- `GET /super-admin/catalog/modules`
- `POST /super-admin/catalog/modules`
- `PUT /super-admin/catalog/modules/:id`
- `GET /super-admin/catalog/groups`
- `POST /super-admin/catalog/groups`
- `PUT /super-admin/catalog/groups/:id`
- `GET /super-admin/catalog/routines`
- `POST /super-admin/catalog/routines`
- `PUT /super-admin/catalog/routines/:id`
- `PUT /super-admin/catalog/routines/:id/actions`

Aplicar regras:

- sem exclusao fisica
- rotina fora de menu nao acessa
- reorganizacao com efeito global imediato

**Step 4: Run test to verify it passes**

Run: `pnpm --filter api test:e2e -- super-admin-catalog.e2e-spec.ts --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/super-admin apps/api/test/super-admin-catalog.e2e-spec.ts
git commit -m "feat: add super admin catalog governance"
```

### Task 8: Implementar governanca global de features e tenant features

> **Status registrado em 2026-06-17:** nao iniciar antes de definir a politica de auto-habilitacao de `features` pelo tenant.
>
> Pendencia funcional:
> - permitir ao `tenant` habilitar qualquer `feature` global existente
> - ou restringir a escolha a `features` marcadas como `auto habilitaveis pelo tenant`
>
> Pendencia estrutural correlata:
> - a camada de governanca global de perfis segue tenant-scoped no schema atual e usa `tenantId` explicito nas APIs de `Super Admin`

**Files:**
- Create: `apps/api/src/super-admin/super-admin-features.controller.ts`
- Create: `apps/api/src/super-admin/super-admin-features.service.ts`
- Modify: `apps/api/src/tenant-admin/tenant-settings.controller.ts`
- Test: `apps/api/test/features-governance.e2e-spec.ts`

**Step 1: Write the failing test**

```ts
it('allows tenant to choose only globally defined features and enforces tenant self-service policy', async () => {
  expect(globalCreate.status).toBe(201);
  expect(invalidTenantSelection.status).toBe(400);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter api test:e2e -- features-governance.e2e-spec.ts --runInBand`
Expected: FAIL

**Step 3: Write minimal implementation**

Criar:

- CRUD global de features no `Super Admin`
- validacao de escolha de features no cadastro do tenant
- politica configuravel para `auto habilitavel pelo tenant`

**Step 4: Run test to verify it passes**

Run: `pnpm --filter api test:e2e -- features-governance.e2e-spec.ts --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/super-admin apps/api/src/tenant-admin apps/api/test/features-governance.e2e-spec.ts
git commit -m "feat: add feature governance"
```

### Task 9: Adaptar backoffice para administracao de usuarios e menu dinamico

**Files:**
- Create: `apps/backoffice/src/app/core/menu/menu.service.ts`
- Create: `apps/backoffice/src/app/features/admin/**/*.ts`
- Modify: `apps/backoffice/src/app/app.routes.ts`
- Modify: `apps/backoffice/src/app/app.component.ts`
- Test: `apps/backoffice/src/app/core/menu/menu.service.spec.ts`

**Step 1: Write the failing test**

```ts
it('maps resolved backend menu and hides unavailable items from tenant administration screens', () => {
  expect(items[0].label).toBe('Cadastro');
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter backoffice test -- menu.service.spec.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Implementar:

- consumo de `GET /me/menu`
- telas de usuarios do tenant
- atribuicao de perfis pelo tenant
- telas globais de `Super Admin` para catalogo, perfis e features

**Step 4: Run test to verify it passes**

Run: `pnpm --filter backoffice test -- menu.service.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/backoffice/src/app
git commit -m "feat: add admin backoffice flows"
```

### Task 10: Fechar auditoria e documentacao administrativa

**Files:**
- Modify: `apps/api/src/audit/audit.interceptor.ts`
- Create: `docs/api/admin-governance.md`
- Modify: `README.md`
- Test: `apps/api/test/admin-audit.e2e-spec.ts`

**Step 1: Write the failing test**

```ts
it('audits tenant admin and super admin governance changes', async () => {
  expect(audit.action).toBe('tenant.user.block');
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter api test:e2e -- admin-audit.e2e-spec.ts --runInBand`
Expected: FAIL

**Step 3: Write minimal implementation**

Auditar:

- manutencao de tenant
- manutencao de usuario
- atribuicao de perfil
- governanca global de catalogo
- governanca de features
- bloqueio automatico por perda de ultimo perfil ativo

Documentar:

- fronteiras `Super Admin` x `tenant`
- regras de visibilidade
- regras de bloqueio automatico
- contrato das APIs administrativas

**Step 4: Run test to verify it passes**

Run: `pnpm --filter api test:e2e -- admin-audit.e2e-spec.ts --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/audit docs/api/admin-governance.md README.md apps/api/test/admin-audit.e2e-spec.ts
git commit -m "chore: add admin governance audit and docs"
```

## Ordem recomendada

1. Modelo fisico administrativo
2. API de menu e permissoes resolvidas
3. CRUD de usuarios do tenant
4. Atribuicao de perfis pelo tenant
5. CRUD do proprio tenant
6. Governanca global de perfis
7. Governanca global de catalogo e menu
8. Governanca global de features
9. Frontend administrativo
10. Auditoria e documentacao

## Riscos principais

- misturar visao parcial do tenant com visao global do `Super Admin`
- permitir remocao indireta do ultimo perfil ativo
- nao bloquear usuario automaticamente ao perder perfil aplicavel
- esconder item no frontend sem negar no backend
- deixar features sem governanca central suficiente

## Criterios minimos de aceite

- tenant administra seus usuarios sem governanca estrutural de perfil
- `Super Admin` administra perfis, grants, overrides, catalogo e features
- menu dinamico reflete catalogo ativo e acesso resolvido
- perfis protegidos nao ficam visiveis ao tenant
- usuario sem perfil ativo aplicavel e bloqueado automaticamente
- inativacao global de catalogo produz efeito imediato em menu e autorizacao
- auditoria cobre operacoes administrativas principais

## Status de execucao

### Onde estamos

- Tasks 1 a 7 concluidas no backend
- Task 8 pausada por pendencia funcional da politica de auto-habilitacao de `features`
- Tasks 9 e 10 ainda nao iniciadas

### Proximos passos

1. decidir a politica de self-service de `features` do tenant
2. executar a Task 8
3. executar a Task 9
4. executar a Task 10
