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

