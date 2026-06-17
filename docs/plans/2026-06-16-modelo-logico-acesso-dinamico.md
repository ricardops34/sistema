# Modelo Lógico do Acesso Dinâmico

Data: 2026-06-16
Status: Rascunho validado em colaboração

## 1. Objetivo

Detalhar o modelo lógico de banco para o módulo de acesso dinâmico da plataforma, suportando:

- controle por módulo
- controle por grupo
- controle por rotina
- controle por ação
- perfis por tenant
- exceções por usuário
- menu dinâmico
- impersonação controlada de `Super Admin`

## 2. Separação de Camadas no Banco

O modelo deve separar claramente três camadas:

- `catálogo funcional global`
- `governança de acesso por tenant`
- `sessão, impersonação e auditoria`

### 2.1 Catálogo funcional global

Pertence à plataforma e não possui `tenant_id`.

### 2.2 Governança por tenant

Pertence ao tenant e deve sempre carregar `tenant_id`.

### 2.3 Sessão e auditoria

Pode conter tabelas globais e tabelas com contexto de tenant, conforme o evento registrado.

## 3. Catálogo Funcional Global

### 3.1 app_module

Representa o domínio principal do sistema.

Campos principais:

- `app_module_id`
- `code`
- `name`
- `icon`
- `route_base`
- `display_order`
- `is_active`
- `created_at`
- `updated_at`

Restrições:

- unicidade global de `code`

### 3.2 app_menu_group

Organiza visualmente as rotinas dentro do módulo.

Campos principais:

- `app_menu_group_id`
- `app_module_id`
- `code`
- `name`
- `icon`
- `display_order`
- `is_active`
- `created_at`
- `updated_at`

Restrições:

- unicidade por `app_module_id + code`

### 3.3 app_routine

Representa a unidade navegável do sistema.

Campos principais:

- `app_routine_id`
- `app_module_id`
- `app_menu_group_id`
- `code`
- `name`
- `route_path`
- `component_key`
- `display_order`
- `is_visible_in_menu`
- `is_active`
- `created_at`
- `updated_at`

Restrições:

- unicidade global de `code`, ou no mínimo por `app_module_id + code`

### 3.4 app_routine_action

Representa a ação operacional dentro da rotina.

Campos principais:

- `app_routine_action_id`
- `app_routine_id`
- `code`
- `name`
- `action_type`
- `display_order`
- `is_active`
- `created_at`
- `updated_at`

Restrições:

- unicidade por `app_routine_id + code`

### 3.5 app_routine_feature

Opcional, mas recomendada para vincular rotina ou ação à feature contratável.

Campos principais:

- `app_routine_feature_id`
- `app_routine_id`
- `feature_id`
- `is_required`

## 4. Governança de Acesso por Tenant

### 4.1 tenant_profile

Representa o perfil funcional reutilizável.

Campos principais:

- `tenant_profile_id`
- `tenant_id`
- `code`
- `name`
- `description`
- `is_system`
- `is_active`
- `created_at`
- `updated_at`

Restrições:

- unicidade por `tenant_id + code`

### 4.2 tenant_profile_routine_grant

Concede ou nega rotina ao perfil.

Campos principais:

- `tenant_profile_routine_grant_id`
- `tenant_id`
- `tenant_profile_id`
- `app_routine_id`
- `effect`
- `created_at`
- `updated_at`

Valores esperados de `effect`:

- `allow`
- `deny`

Restrições:

- unicidade por `tenant_id + tenant_profile_id + app_routine_id`

### 4.3 tenant_profile_action_grant

Concede ou nega ação ao perfil.

Campos principais:

- `tenant_profile_action_grant_id`
- `tenant_id`
- `tenant_profile_id`
- `app_routine_action_id`
- `effect`
- `created_at`
- `updated_at`

Restrições:

- unicidade por `tenant_id + tenant_profile_id + app_routine_action_id`

### 4.4 tenant_user_profile

Relaciona usuário e perfil.

Campos principais:

- `tenant_user_profile_id`
- `tenant_id`
- `tenant_user_id`
- `tenant_profile_id`
- `is_active`
- `created_at`
- `updated_at`

Restrições:

- unicidade por `tenant_id + tenant_user_id + tenant_profile_id`

### 4.5 tenant_user_routine_override

Concede ou nega rotina no nível individual.

Campos principais:

- `tenant_user_routine_override_id`
- `tenant_id`
- `tenant_user_id`
- `app_routine_id`
- `effect`
- `reason`
- `created_at`
- `updated_at`

Restrições:

- unicidade por `tenant_id + tenant_user_id + app_routine_id`

### 4.6 tenant_user_action_override

Concede ou nega ação no nível individual.

Campos principais:

- `tenant_user_action_override_id`
- `tenant_id`
- `tenant_user_id`
- `app_routine_action_id`
- `effect`
- `reason`
- `created_at`
- `updated_at`

Restrições:

- unicidade por `tenant_id + tenant_user_id + app_routine_action_id`

## 5. Regras de Integridade

Regras obrigatórias:

- toda tabela do tenant deve carregar `tenant_id`
- toda foreign key entre tabelas do tenant deve respeitar o mesmo `tenant_id`
- grants e overrides não devem existir sem referência válida ao catálogo global
- `effect` deve ser restrito a valores controlados
- registros inativos não devem participar da resolução final de acesso

## 6. Sessão, Menu e Cache de Autorização

### 6.1 auth_session

Já existente no produto, deve continuar carregando:

- identidade autenticada
- tenant ativo
- canal
- usuário efetivo

Também pode evoluir para suportar:

- `authorization_version`
- `menu_version`

### 6.2 auth_session_menu_cache

Opcional no primeiro momento, mas recomendado em evolução futura.

Campos principais:

- `auth_session_menu_cache_id`
- `auth_session_id`
- `tenant_id`
- `tenant_user_id`
- `menu_payload`
- `authorization_version`
- `created_at`
- `expires_at`

Finalidade:

- cache de árvore de menu resolvida
- redução de custo de recomputação

## 7. Impersonação

### 7.1 super_admin_impersonation_session

Tabela própria para manter contexto de impersonação.

Campos principais:

- `super_admin_impersonation_session_id`
- `platform_identity_id`
- `target_tenant_id`
- `target_tenant_user_id`
- `reason`
- `status`
- `started_at`
- `ended_at`
- `created_at`

Regras:

- a identidade original do operador nunca deve ser perdida
- o tenant alvo deve ser explícito
- o usuário alvo pode ser nulo
- toda impersonação deve ser auditada

## 8. Auditoria de Acesso

O modelo lógico deve prever rastreabilidade de decisões de autorização.

Estruturas esperadas:

- uso do `audit_event` atual com granularidade adequada
- ou tabela específica de eventos de acesso

Eventos relevantes:

- criação de perfil
- alteração de perfil
- concessão de rotina
- concessão de ação
- criação de override
- revogação de override
- montagem de menu
- acesso negado
- início de impersonação
- encerramento de impersonação

## 9. Relação com Escopo Organizacional

O modelo de acesso dinâmico não substitui o escopo organizacional do tenant.

Separação:

- rotina controla entrada na funcionalidade
- ação controla capacidade operacional
- escopo controla alcance dos dados

Isso significa que as tabelas já existentes de escopo continuam válidas e devem ser aplicadas após a resolução de rotina e ação.

## 10. Regras de Precedência

Ordem recomendada de resolução:

1. catálogo funcional global
2. features habilitadas para o tenant
3. grants dos perfis
4. overrides do usuário
5. escopo organizacional

Regras práticas:

- ausência de `allow` mantém acesso indisponível
- `deny` explícito em override deve prevalecer sobre `allow` de perfil
- `allow` individual não pode criar acesso fora do catálogo ou fora das features do tenant

## 11. Relacionamentos Principais

Relacionamentos centrais do modelo:

- `app_module 1:N app_menu_group`
- `app_module 1:N app_routine`
- `app_menu_group 1:N app_routine`
- `app_routine 1:N app_routine_action`
- `tenant_profile 1:N tenant_profile_routine_grant`
- `tenant_profile 1:N tenant_profile_action_grant`
- `tenant_user N:N tenant_profile`
- `tenant_user 1:N tenant_user_routine_override`
- `tenant_user 1:N tenant_user_action_override`
- `auth_session 1:0..1 auth_session_menu_cache`
- `platform_identity 1:N super_admin_impersonation_session`

## 12. Índices Recomendados

Índices principais:

- `app_module.code`
- `app_menu_group(app_module_id, code)`
- `app_routine(code)`
- `app_routine_action(app_routine_id, code)`
- `tenant_profile(tenant_id, code)`
- `tenant_user_profile(tenant_id, tenant_user_id)`
- `tenant_profile_routine_grant(tenant_id, tenant_profile_id)`
- `tenant_profile_action_grant(tenant_id, tenant_profile_id)`
- `tenant_user_routine_override(tenant_id, tenant_user_id)`
- `tenant_user_action_override(tenant_id, tenant_user_id)`
- `super_admin_impersonation_session(platform_identity_id, status)`

## 13. Gap Analysis

Definido:

- tabelas globais do catálogo funcional
- tabelas por tenant para perfis e overrides
- tabela lógica de impersonação
- regra geral de precedência
- papel do menu dinâmico e cache opcional

Ainda em aberto:

- estratégia final de cache de menu
- política exata para histórico de overrides antigos
- catálogo inicial real de módulos, grupos, rotinas e ações
- contrato final da API que consumirá este modelo

## 14. Próximos Passos Recomendados

1. Gerar plano de implementação do módulo de acesso dinâmico.
2. Integrar esse modelo ao documento principal da plataforma.
3. Definir catálogo inicial do produto para módulos, grupos, rotinas e ações.
4. Especificar a API de montagem do menu e de governança de perfis.
