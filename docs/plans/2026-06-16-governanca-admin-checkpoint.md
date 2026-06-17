# Checkpoint de Governança Administrativa

Data: 2026-06-16
Status: Em definição guiada

## 1. Escopo já fechado

### 1.1 Catálogo global da plataforma

Mantido exclusivamente por usuários com perfil `Super Admin`:

- módulos
- grupos
- rotinas
- ações
- estrutura de menu
- catálogo global de features

Regras:

- catálogo é global
- efeito de inativação é imediato para todos os tenants
- `Super Admin` pode reorganizar a estrutura visual do menu
- se a rotina não estiver no menu, ela não pode ser acessada

### 1.2 Ações

Modelo definido:

- existe um catálogo padrão global de ações
- o `Super Admin` pode personalizar por rotina quais ações padrão ficam disponíveis
- o tenant só enxerga ações efetivamente disponíveis

### 1.3 Tenants

`Super Admin` pode:

- cadastrar
- editar
- inativar
- excluir operacionalmente

O próprio `tenant` pode:

- editar o próprio cadastro
- alterar `plano`
- alterar `limites`
- alterar `features habilitadas`

O próprio `tenant` não pode:

- alterar `slug`
- inativar o próprio cadastro
- excluir o próprio cadastro

Regra adicional:

- features do tenant só podem ser escolhidas dentro do catálogo global definido pelo `Super Admin`

### 1.4 Usuários do tenant

`Super Admin` pode:

- cadastrar
- editar
- ativar
- inativar
- bloquear
- desbloquear
- redefinir senha

O próprio `tenant` também pode, dentro do seu tenant:

- cadastrar usuário
- editar usuário
- ativar
- inativar
- bloquear
- desbloquear
- redefinir senha

Regras:

- não há exclusão física de usuário
- usuário pode ser criado ativo
- usuário pode ser criado com perfil já na criação
- usuário também pode ser criado sem perfil e receber perfil depois
- sem perfil válido o usuário não opera funcionalmente
- se perder o último perfil ativo aplicável, o usuário deve ser bloqueado automaticamente

### 1.5 Auto-administração protegida

O usuário logado não pode:

- se auto-inativar
- se auto-bloquear
- remover de si o último perfil ativo

### 1.6 Perfis

Perfis são mantidos exclusivamente pelo `Super Admin`.

Somente o `Super Admin` pode:

- criar perfil
- editar perfil
- inativar perfil
- definir grants de rotina
- definir grants de ação
- definir overrides por usuário

Regras:

- perfis podem ser inativados mesmo vinculados a usuários
- se a inativação deixar usuário sem perfil ativo aplicável, o usuário deve ser bloqueado automaticamente

### 1.7 Atribuição de perfis pelo tenant

O tenant não cria perfil.

O tenant pode:

- atribuir perfis aos seus usuários
- remover perfis atribuíveis por tenant

Limites:

- nunca pode atribuir perfil `Super Admin`
- só pode ver perfis marcados como `atribuíveis por tenant`
- não pode remover o último perfil ativo do usuário

### 1.8 Perfis protegidos pela plataforma

Perfis vinculados pelo `Super Admin` ficam protegidos.

Regras:

- o tenant não pode remover esses vínculos
- o tenant não vê esses vínculos protegidos
- somente o `Super Admin` enxerga perfis protegidos no usuário

### 1.9 Visão operacional do tenant

O tenant só enxerga o que estiver efetivamente disponível:

- módulos
- grupos
- rotinas
- ações
- perfis atribuíveis por tenant

O tenant não enxerga:

- catálogo global completo
- estruturas inativas ou indisponíveis
- perfis protegidos do `Super Admin`

## 2. Regras implícitas já necessárias

- auditoria obrigatória para alterações em tenant, usuários, perfis, grants, overrides, menu e features
- menu e autorização devem ignorar itens inativos
- grants históricos podem permanecer, mas não produzem acesso se catálogo global estiver inativo
- reorganização visual do menu não altera grants por si só

## 3. Ponto exato da conversa

Pergunta pendente:

> o `tenant` pode habilitar qualquer `feature` global existente, ou só as features marcadas como `auto habilitáveis pelo tenant`?

Última resposta confirmada antes da pausa:

- `features` precisam existir em um catálogo global definido pelo `Super Admin`
## 4. Pendencias registradas

### 4.1 Regra funcional ainda em aberto

- definir se o `tenant` pode habilitar qualquer `feature` global existente
- ou se o `tenant` so pode habilitar `features` marcadas como `auto habilitaveis pelo tenant`

Impacto:

- a Task 8 permanece bloqueada atÃ© fechamento dessa regra
- a validacao final de self-service de `features` do tenant ainda nao pode ser consolidada

### 4.2 Restricao estrutural atual do modelo de perfis

- o modelo atual de `tenant_profile` continua escopado por `tenant`
- a governanca global implementada nas Tasks 6 e 7 usa `tenantId` explicito nas APIs de `Super Admin`
- perfis verdadeiramente globais exigem evolucao estrutural adicional do schema

Impacto:

- a API global de perfis funciona no estado atual
- mas a plataforma ainda nao tem um catalogo de perfis global desacoplado do `tenant`

## 5. Onde estamos

- Tasks 1 a 7 do plano foram implementadas no backend `apps/api`
- o modelo fisico administrativo foi endurecido com suporte a atribuicao por tenant, vinculo protegido por plataforma, visibilidade de menu e limites do tenant
- a API `GET /me/menu` e `GET /me/permissions` foi entregue
- o modulo `tenant-admin` foi entregue para usuarios, perfis do usuario e configuracoes do proprio tenant
- o modulo `super-admin` foi entregue para perfis, grants, overrides e catalogo global de modulos, grupos, rotinas e acoes
- a execucao foi interrompida antes da Task 8, conforme combinado

Verificacao executada:

- `pnpm --filter api test:e2e -- admin-governance-schema.e2e-spec.ts menu.e2e-spec.ts tenant-users.e2e-spec.ts tenant-user-profiles.e2e-spec.ts tenant-settings.e2e-spec.ts admin-profiles.e2e-spec.ts super-admin-catalog.e2e-spec.ts --runInBand`
- resultado: `7` suites e `8` testes passando

## 6. Proximos passos

1. fechar a regra funcional da Task 8 sobre auto-habilitacao de `features` pelo tenant
2. implementar a governanca global de `features` e a validacao de escolha de `features` do tenant
3. adaptar o backoffice para consumir `GET /me/menu` e expor os fluxos administrativos
4. concluir auditoria administrativa e documentacao das APIs
5. decidir se o modelo de perfis deve continuar tenant-scoped ou evoluir para um catalogo global real
