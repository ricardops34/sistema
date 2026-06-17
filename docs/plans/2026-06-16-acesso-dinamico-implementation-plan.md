# Dynamic Access Control Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Implementar catálogo funcional global, perfis por tenant, overrides por usuário, menu dinâmico e impersonação controlada para o módulo de acesso dinâmico da plataforma.

**Architecture:** A implementação deve reaproveitar o backend NestJS atual, substituindo o modelo simplificado de `scopes` em `tenant_role` por um catálogo funcional relacional e uma camada de resolução de permissão por rotina e ação. O frontend Angular consumirá menu resolvido por API, e o `Super Admin` terá sessão de impersonação explícita, auditada e separada do contexto normal do tenant.

**Tech Stack:** NestJS, TypeORM, PostgreSQL, Angular, PO-UI, Jest e2e, JWT, auditoria existente do produto

---

## Premissas do plano

- O sistema já possui autenticação por canal, `tenant context` e autorização básica por `scopes`.
- O módulo atual de pessoas e metadata já usa guards de autorização e serve como ponto de migração.
- A implementação deve manter compatibilidade incremental durante a transição do modelo antigo para o novo.

### Task 1: Criar o catálogo funcional global

**Files:**
- Create: `apps/api/src/database/migrations/0011-access-catalog.ts`
- Create: `apps/api/src/access-catalog/entities/app-module.entity.ts`
- Create: `apps/api/src/access-catalog/entities/app-menu-group.entity.ts`
- Create: `apps/api/src/access-catalog/entities/app-routine.entity.ts`
- Create: `apps/api/src/access-catalog/entities/app-routine-action.entity.ts`
- Test: `apps/api/test/access-catalog.e2e-spec.ts`

**Step 1: Write the failing test**

Criar `apps/api/test/access-catalog.e2e-spec.ts`:

```ts
it('loads global catalog of modules, groups, routines and actions', async () => {
  const modules = await dataSource.query(`SELECT code FROM app_module ORDER BY code`);
  expect(modules.length).toBeGreaterThan(0);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter api test:e2e -- access-catalog.e2e-spec.ts --runInBand`
Expected: FAIL com tabela inexistente

**Step 3: Write minimal implementation**

Criar migration `0011-access-catalog.ts` com:

- `app_module`
- `app_menu_group`
- `app_routine`
- `app_routine_action`

Popular catálogo inicial mínimo:

- módulo `cadastro`
- grupo `cadastros-basicos`
- rotina `people`
- rotina `people-metadata`
- ações `read`, `create`, `update`, `metadata.read`, `metadata.manage`

**Step 4: Run test to verify it passes**

Run: `pnpm --filter api migration:run`
Run: `pnpm --filter api test:e2e -- access-catalog.e2e-spec.ts --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/database/migrations/0011-access-catalog.ts apps/api/src/access-catalog apps/api/test/access-catalog.e2e-spec.ts
git commit -m "feat: add global access catalog"
```

### Task 2: Criar tabelas de perfil, grants e overrides

**Files:**
- Create: `apps/api/src/database/migrations/0012-access-governance.ts`
- Create: `apps/api/src/access-control/entities/tenant-profile.entity.ts`
- Create: `apps/api/src/access-control/entities/tenant-profile-routine-grant.entity.ts`
- Create: `apps/api/src/access-control/entities/tenant-profile-action-grant.entity.ts`
- Create: `apps/api/src/access-control/entities/tenant-user-profile.entity.ts`
- Create: `apps/api/src/access-control/entities/tenant-user-routine-override.entity.ts`
- Create: `apps/api/src/access-control/entities/tenant-user-action-override.entity.ts`
- Test: `apps/api/test/access-governance.e2e-spec.ts`

**Step 1: Write the failing test**

```ts
it('stores tenant profile with routine and action grants', async () => {
  const profile = await dataSource.query(`SELECT code FROM tenant_profile WHERE tenant_id = $1`, [tenantId]);
  expect(profile.length).toBeGreaterThan(0);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter api test:e2e -- access-governance.e2e-spec.ts --runInBand`
Expected: FAIL com tabelas inexistentes

**Step 3: Write minimal implementation**

Criar migration `0012-access-governance.ts` com:

- `tenant_profile`
- `tenant_profile_routine_grant`
- `tenant_profile_action_grant`
- `tenant_user_profile`
- `tenant_user_routine_override`
- `tenant_user_action_override`

**Step 4: Run test to verify it passes**

Run: `pnpm --filter api migration:run`
Run: `pnpm --filter api test:e2e -- access-governance.e2e-spec.ts --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/database/migrations/0012-access-governance.ts apps/api/src/access-control apps/api/test/access-governance.e2e-spec.ts
git commit -m "feat: add tenant access governance tables"
```

### Task 3: Criar serviço de resolução de permissão

**Files:**
- Create: `apps/api/src/access-control/access-control.module.ts`
- Create: `apps/api/src/access-control/access-resolution.service.ts`
- Create: `apps/api/src/access-control/types/resolved-access.type.ts`
- Test: `apps/api/test/access-resolution.e2e-spec.ts`

**Step 1: Write the failing test**

```ts
it('resolves routine and action access from profile grants', async () => {
  const resolved = await service.resolveForUser({ tenantId, tenantUserId });
  expect(resolved.routines).toContain('people');
  expect(resolved.actions).toContain('people.create');
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter api test:e2e -- access-resolution.e2e-spec.ts --runInBand`
Expected: FAIL porque o serviço não existe

**Step 3: Write minimal implementation**

Implementar resolução em ordem:

1. catálogo global
2. grants de perfil
3. overrides de usuário

Nesta tarefa ainda não precisa incluir cache nem features por plano.

**Step 4: Run test to verify it passes**

Run: `pnpm --filter api test:e2e -- access-resolution.e2e-spec.ts --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/access-control apps/api/test/access-resolution.e2e-spec.ts
git commit -m "feat: add access resolution service"
```

### Task 4: Migrar o onboarding para criar perfil admin relacional

**Files:**
- Modify: `apps/api/src/onboarding/onboarding.service.ts`
- Test: `apps/api/test/onboarding.e2e-spec.ts`

**Step 1: Write the failing test**

Adicionar em `apps/api/test/onboarding.e2e-spec.ts`:

```ts
it('creates default admin profile and grants during onboarding', async () => {
  const profile = await dataSource.query(`SELECT code FROM tenant_profile WHERE tenant_id = $1`, [tenantId]);
  expect(profile[0].code).toBe('admin');
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter api test:e2e -- onboarding.e2e-spec.ts --runInBand`
Expected: FAIL

**Step 3: Write minimal implementation**

Ao criar tenant:

- criar `tenant_profile` admin
- vincular grants de rotinas e ações
- associar o usuário admin em `tenant_user_profile`

Manter compatibilidade com os campos antigos até a migração completa dos guards.

**Step 4: Run test to verify it passes**

Run: `pnpm --filter api test:e2e -- onboarding.e2e-spec.ts --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/onboarding/onboarding.service.ts apps/api/test/onboarding.e2e-spec.ts
git commit -m "feat: seed tenant admin profile during onboarding"
```

### Task 5: Substituir autorização baseada em scopes simples pela resolução relacional

**Files:**
- Modify: `apps/api/src/authorization/scopes.guard.ts`
- Modify: `apps/api/src/tenancy/tenant-context.guard.ts`
- Modify: `apps/api/src/people/people.controller.ts`
- Modify: `apps/api/src/people-metadata/people-metadata.controller.ts`
- Modify: `apps/api/src/people-requests/people-requests.controller.ts`
- Test: `apps/api/test/people-authorization.e2e-spec.ts`

**Step 1: Write the failing test**

Adicionar caso:

```ts
it('uses routine and action grants instead of legacy role scopes', async () => {
  expect(response.status).toBe(403);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter api test:e2e -- people-authorization.e2e-spec.ts --runInBand`
Expected: FAIL

**Step 3: Write minimal implementation**

Migrar `ScopesGuard` para consultar `AccessResolutionService` e validar:

- acesso à rotina
- ação requerida

Manter `RequireScopes` apenas como compatibilidade temporária ou substituí-lo por decorator novo, como `RequireAction`.

**Step 4: Run test to verify it passes**

Run: `pnpm --filter api test:e2e -- people-authorization.e2e-spec.ts --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/authorization apps/api/src/tenancy apps/api/src/people apps/api/src/people-metadata apps/api/src/people-requests apps/api/test/people-authorization.e2e-spec.ts
git commit -m "feat: enforce relational access grants in guards"
```

### Task 6: Expor API de menu dinâmico

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
Expected: FAIL

**Step 3: Write minimal implementation**

Criar `GET /me/menu` retornando árvore:

```json
{
  "modules": [
    {
      "code": "cadastro",
      "groups": [
        {
          "code": "cadastros-basicos",
          "routines": [
            { "code": "people", "routePath": "/people" }
          ]
        }
      ]
    }
  ]
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter api test:e2e -- menu.e2e-spec.ts --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/me apps/api/test/menu.e2e-spec.ts
git commit -m "feat: add dynamic menu api"
```

### Task 7: Implementar administração de perfis e grants

**Files:**
- Create: `apps/api/src/admin-access/admin-access.module.ts`
- Create: `apps/api/src/admin-access/admin-profiles.controller.ts`
- Create: `apps/api/src/admin-access/admin-profiles.service.ts`
- Test: `apps/api/test/admin-profiles.e2e-spec.ts`

**Step 1: Write the failing test**

```ts
it('creates a tenant profile and assigns routine grants', async () => {
  expect(response.status).toBe(201);
  expect(response.body.code).toBe('operador-cadastro');
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter api test:e2e -- admin-profiles.e2e-spec.ts --runInBand`
Expected: FAIL

**Step 3: Write minimal implementation**

Endpoints mínimos:

- `GET /admin/profiles`
- `POST /admin/profiles`
- `PUT /admin/profiles/:id/routines`
- `PUT /admin/profiles/:id/actions`
- `PUT /admin/users/:id/profiles`
- `PUT /admin/users/:id/overrides`

**Step 4: Run test to verify it passes**

Run: `pnpm --filter api test:e2e -- admin-profiles.e2e-spec.ts --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/admin-access apps/api/test/admin-profiles.e2e-spec.ts
git commit -m "feat: add tenant access administration endpoints"
```

### Task 8: Implementar impersonação controlada do Super Admin

**Files:**
- Create: `apps/api/src/database/migrations/0013-super-admin-impersonation.ts`
- Create: `apps/api/src/super-admin/entities/super-admin-impersonation-session.entity.ts`
- Create: `apps/api/src/super-admin/super-admin.module.ts`
- Create: `apps/api/src/super-admin/super-admin.controller.ts`
- Create: `apps/api/src/super-admin/super-admin.service.ts`
- Test: `apps/api/test/super-admin-impersonation.e2e-spec.ts`

**Step 1: Write the failing test**

```ts
it('starts and stops impersonation session with audit trail', async () => {
  expect(start.status).toBe(201);
  expect(stop.status).toBe(200);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter api test:e2e -- super-admin-impersonation.e2e-spec.ts --runInBand`
Expected: FAIL

**Step 3: Write minimal implementation**

Criar:

- tabela `super_admin_impersonation_session`
- `POST /super-admin/impersonation/start`
- `POST /super-admin/impersonation/stop`

Registrar:

- identidade original
- tenant alvo
- razão
- timestamps

**Step 4: Run test to verify it passes**

Run: `pnpm --filter api test:e2e -- super-admin-impersonation.e2e-spec.ts --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/database/migrations/0013-super-admin-impersonation.ts apps/api/src/super-admin apps/api/test/super-admin-impersonation.e2e-spec.ts
git commit -m "feat: add super admin impersonation flow"
```

### Task 9: Adaptar o frontend para consumir menu dinâmico

**Files:**
- Create: `apps/backoffice/src/app/core/menu/menu.service.ts`
- Modify: `apps/backoffice/src/app/app.routes.ts`
- Modify: `apps/backoffice/src/app/app.component.ts`
- Test: `apps/backoffice/src/app/core/menu/menu.service.spec.ts`

**Step 1: Write the failing test**

```ts
it('maps backend menu payload to po-menu structure', () => {
  expect(items[0].label).toBe('Cadastro');
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter backoffice test -- menu.service.spec.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

O frontend deve:

- chamar `GET /me/menu`
- montar estrutura consumível pelo componente de navegação
- esconder rotinas não liberadas

**Step 4: Run test to verify it passes**

Run: `pnpm --filter backoffice test -- menu.service.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/backoffice/src/app/core/menu apps/backoffice/src/app/app.routes.ts apps/backoffice/src/app/app.component.ts
git commit -m "feat: render dynamic backoffice menu"
```

### Task 10: Auditoria e documentação do módulo de acesso

**Files:**
- Modify: `apps/api/src/audit/audit.interceptor.ts`
- Create: `docs/api/access-control.md`
- Create: `docs/runbooks/super-admin-impersonation.md`
- Modify: `README.md`

**Step 1: Write the failing test**

```ts
it('audits profile override changes', async () => {
  expect(audit.action).toBe('access.user_override.update');
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter api test:e2e -- admin-profiles.e2e-spec.ts --runInBand`
Expected: FAIL por ausência de auditoria específica

**Step 3: Write minimal implementation**

Registrar auditoria para:

- criação/edição de perfil
- grants de rotina
- grants de ação
- overrides
- início/fim de impersonação

Documentar:

- contrato da API de menu
- governança de perfis
- fluxo de impersonação

**Step 4: Run test to verify it passes**

Run: `pnpm --filter api test:e2e -- admin-profiles.e2e-spec.ts --runInBand`
Run: `pnpm --filter api test:e2e -- super-admin-impersonation.e2e-spec.ts --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/audit docs/api/access-control.md docs/runbooks/super-admin-impersonation.md README.md
git commit -m "chore: add access-control audit trail and docs"
```

## Ordem recomendada de execução

1. Catálogo global
2. Tabelas de governança por tenant
3. Serviço de resolução
4. Onboarding admin padrão
5. Guards e autorização relacional
6. API de menu
7. Administração de perfis e overrides
8. Super Admin e impersonação
9. Frontend do menu dinâmico
10. Auditoria e documentação

## Riscos principais

- manter o modelo antigo de `scopes` e o novo ativo por tempo demais
- não definir bem precedência entre grants e overrides
- montar menu no frontend sem autoridade final no backend
- misturar permissões de tenant com permissões globais de `Super Admin`
- não auditar overrides e impersonação

## Critérios mínimos de aceite

- catálogo global de módulos, grupos, rotinas e ações persistido
- perfis por tenant com grants de rotina e ação
- overrides por usuário funcionando
- endpoints de menu dinâmico entregando árvore filtrada
- guards usando resolução relacional, não só `scopes` legados
- impersonação do `Super Admin` auditada
- backoffice consumindo menu dinâmico com sucesso
- suíte e2e cobrindo grants, denies, overrides e impersonação
