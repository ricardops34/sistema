# Especificacao de Governanca Administrativa

Data: 2026-06-16
Status: Rascunho consolidado

## 1. Objetivo

Definir a governanca administrativa da plataforma para:

- cadastro e manutencao de tenants
- cadastro e manutencao de usuarios
- atribuicao de perfis
- administracao global do catalogo funcional
- administracao global de menu
- administracao global de features

O objetivo e separar com clareza o que pertence ao `Super Admin` e o que pertence ao proprio `tenant`.

## 2. Principios

- o catalogo funcional do produto e global
- o tenant administra sua operacao, mas nao define a estrutura do produto
- perfis, grants e overrides sao governanca da plataforma
- usuarios nao sao excluidos fisicamente
- inativacao deve produzir efeito imediato na autorizacao e no menu
- toda alteracao administrativa relevante deve ser auditada

## 3. Papeis Administrativos

### 3.1 Super Admin

Usuario global da plataforma com governanca total sobre:

- tenants
- usuarios de qualquer tenant
- perfis
- grants de rotina
- grants de acao
- overrides por usuario
- modulos
- grupos
- rotinas
- acoes
- estrutura de menu
- catalogo global de features

### 3.2 Administrador do Tenant

Usuario interno do tenant que pode:

- editar o cadastro do proprio tenant, com limites definidos
- cadastrar e manter usuarios do proprio tenant
- atribuir perfis permitidos aos usuarios do proprio tenant
- bloquear, desbloquear, ativar, inativar e redefinir senha de usuarios do proprio tenant

Esse administrador nunca pode atuar como `Super Admin`.

## 4. Regras de Tenant

### 4.1 O que o Super Admin pode fazer

- cadastrar tenant
- editar tenant
- inativar tenant
- excluir operacionalmente tenant

### 4.2 O que o proprio tenant pode fazer

- editar o proprio cadastro
- alterar `plano`
- alterar `limites`
- alterar `features habilitadas`

### 4.3 O que o proprio tenant nao pode fazer

- alterar `slug`
- inativar o proprio cadastro
- excluir o proprio cadastro

## 5. Regras de Usuario

### 5.1 Operacoes permitidas

Tanto `Super Admin` quanto administradores do tenant podem, dentro do escopo correto:

- cadastrar usuario
- editar usuario
- ativar usuario
- inativar usuario
- bloquear usuario
- desbloquear usuario
- redefinir senha

### 5.2 Regras obrigatorias

- nao existe exclusao fisica de usuario
- usuario pode ser criado `ativo`
- usuario pode ser criado com perfil ja na criacao
- usuario tambem pode ser criado sem perfil e receber perfil depois
- usuario sem perfil valido nao deve operar funcionalmente
- se perder o ultimo perfil ativo aplicavel, deve ser bloqueado automaticamente

### 5.3 Auto-administracao protegida

O usuario logado nao pode:

- se auto-inativar
- se auto-bloquear
- remover de si o ultimo perfil ativo

## 6. Regras de Perfil

### 6.1 Propriedade dos perfis

Perfis sao mantidos exclusivamente pelo `Super Admin`.

Somente o `Super Admin` pode:

- criar perfil
- editar perfil
- inativar perfil
- definir grants de rotina
- definir grants de acao
- definir overrides por usuario

### 6.2 Atribuicao de perfis pelo tenant

O tenant nao cria perfil.

O tenant pode apenas atribuir e remover perfis nos seus usuarios quando:

- o perfil estiver `ativo`
- o perfil estiver marcado como `atribuivel por tenant`
- o vinculo nao for protegido pela plataforma

O tenant nunca pode:

- atribuir perfil `Super Admin`
- remover o ultimo perfil ativo do usuario
- alterar grants ou estrutura do perfil

### 6.3 Perfis protegidos

Perfis vinculados pelo `Super Admin` podem ser protegidos.

Quando protegidos:

- o tenant nao pode remover o vinculo
- o tenant nao ve o vinculo
- somente o `Super Admin` enxerga esse perfil no usuario

### 6.4 Inativacao de perfil

O `Super Admin` pode inativar perfil mesmo com usuarios vinculados.

Consequencia:

- o perfil deixa de conceder acesso imediatamente
- se o usuario ficar sem perfil ativo aplicavel, deve ser bloqueado automaticamente

## 7. Catalogo Funcional Global

O catalogo global e mantido apenas por usuarios `Super Admin`.

Escopo:

- modulos
- grupos
- rotinas
- acoes
- estrutura do menu

### 7.1 Regras de estrutura

- `Super Admin` pode reorganizar a estrutura visual do menu
- pode mover rotina entre grupos
- pode mover grupo entre modulos
- o efeito e global e imediato

### 7.2 Regras de disponibilidade

- se uma rotina nao estiver no menu, ela nao pode ser acessada
- rotina fora do menu deve ser negada pelo backend
- inativacao de modulo, grupo, rotina ou acao tem efeito imediato para todos os tenants

### 7.3 Politica de exclusao

Para:

- usuarios
- perfis
- modulos
- grupos
- rotinas
- acoes
- estrutura de menu

A politica e de `inativacao`, nao exclusao fisica.

## 8. Catalogo de Acoes

Existe um catalogo padrao global de acoes da plataforma.

Exemplos:

- `read`
- `create`
- `update`
- `delete`
- `approve`
- `import`
- `manage`

Regras:

- o `Super Admin` nao cria acoes arbitrarias livremente
- ele personaliza por rotina quais acoes padrao ficam disponiveis
- o tenant so enxerga acoes efetivamente disponiveis na rotina

## 9. Features

Existe um catalogo global de features, mantido pelo `Super Admin`.

Regras:

- o tenant nao cria features novas
- o tenant so pode habilitar features existentes no catalogo global

Ponto ainda pendente:

- o tenant podera habilitar qualquer feature global existente
- ou somente features marcadas como `auto habilitaveis pelo tenant`

## 10. Visibilidade do Tenant

O tenant so enxerga o que estiver efetivamente disponivel para sua operacao:

- modulos
- grupos
- rotinas
- acoes
- perfis atribui veis por tenant

O tenant nao enxerga:

- catalogo global completo
- estruturas inativas ou indisponiveis
- perfis protegidos do `Super Admin`

## 11. Auditoria Obrigatoria

Devem ser auditadas, no minimo, as seguintes operacoes:

- criacao e alteracao de tenant
- alteracao de plano, limites e features do tenant
- criacao e alteracao de usuario
- bloqueio e desbloqueio de usuario
- redefinicao de senha
- criacao e alteracao de perfil
- atribuicao e remocao de perfil
- grants e overrides
- inativacao de itens do catalogo global
- reorganizacao de menu

## 12. Conclusao

Com o que ja foi definido, o sistema tem base suficiente para evoluir em cinco frentes:

- API de menu dinamico
- CRUD de usuarios do tenant
- governanca de atribuicao de perfis
- CRUD global de catalogo funcional
- CRUD administrativo de tenants

O unico ponto relevante ainda em aberto para consolidacao final da governanca e a regra de auto-habilitacao de `features` pelo tenant.
