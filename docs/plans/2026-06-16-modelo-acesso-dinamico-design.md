# Especificação do Modelo de Acesso Dinâmico

Data: 2026-06-16
Status: Rascunho validado em colaboração

## 1. Objetivo

Definir um modelo de acesso dinâmico para a plataforma, com controle por:

- módulo
- grupo
- rotina
- ação
- perfil
- exceções por usuário

Esse modelo deve sustentar:

- navegação dinâmica por usuário
- controle funcional detalhado
- autorização compatível com `RBAC + escopo`
- governança de acesso por tenant
- administração global da plataforma via `Super Admin`

## 2. Estratégia Geral de Autorização

O sistema adotará um modelo `híbrido` de autorização.

Isso significa:

- o `perfil` é a origem principal do acesso
- o `usuário` pode receber exceções específicas
- as exceções individuais complementam ou restringem o perfil-base

Esse desenho busca equilíbrio entre:

- governança
- reutilização
- granularidade
- capacidade de ajuste fino

## 3. Hierarquia Funcional

A estrutura funcional do produto será:

- `Módulo > Grupo > Rotina > Ação`

### 3.1 Módulo

Representa o domínio principal do sistema.

Exemplos:

- Cadastro
- Configurações
- Geografia
- Super Admin

### 3.2 Grupo

Representa um agrupador visual e funcional dentro do módulo.

Exemplos:

- Cadastros Básicos
- Administração
- Segurança

### 3.3 Rotina

Representa a unidade navegável do sistema.

É a menor unidade que aparece no menu.

Exemplos:

- Cadastro de Pessoas
- Cadastro de Municípios
- Gestão de Perfis
- Administração de Usuários

### 3.4 Ação

Representa a capacidade operacional dentro da rotina.

Exemplos:

- consultar
- incluir
- editar
- excluir
- aprovar
- importar
- sincronizar
- impersonar

## 4. Regras de Visibilidade e Operação

O menu será controlado por `rotina`.

As `ações` não determinam se a rotina aparece no menu. Elas determinam o que o usuário pode fazer dentro da rotina.

Regras:

- se o usuário tem acesso à rotina, a rotina pode aparecer no menu
- se o usuário não tem acesso à rotina, ela não aparece
- se o usuário acessa a rotina, as ações liberadas controlam botões, operações e recursos internos

Esse desenho evita:

- fragmentação excessiva do menu
- inconsistência visual
- acoplamento entre navegação e botões internos

## 5. Perfis e Exceções por Usuário

### 5.1 Perfis

Perfis serão conjuntos reutilizáveis de permissões atribuídos a usuários do tenant.

Exemplos:

- Administrador do Tenant
- Operador de Cadastro
- Consultor
- Gestor
- Usuário Externo

Cada perfil poderá conceder:

- acesso a rotinas
- ações dentro das rotinas

### 5.2 Exceções por Usuário

O sistema deve permitir ajustes específicos por usuário.

Esses ajustes podem ser:

- concessão adicional
- bloqueio específico

Casos típicos:

- liberar rotina extra para um único usuário
- bloquear exclusão para um usuário dentro de um perfil amplo
- conceder aprovação temporária para um responsável substituto

As exceções devem ser totalmente auditáveis.

## 6. Menu Dinâmico

O menu do sistema não será estático.

Ele deve ser resolvido com base no acesso real do usuário autenticado.

### 6.1 Origem do menu

O menu deve ser montado a partir das rotinas acessíveis.

O processo lógico é:

1. resolver tenant ativo
2. resolver usuário efetivo
3. resolver perfis do usuário
4. aplicar exceções individuais
5. aplicar disponibilidade do tenant por feature/plano
6. montar árvore `Módulo > Grupo > Rotina`

### 6.2 Regras de montagem

- incluir `Rotina` se houver acesso a ela
- incluir `Grupo` se houver ao menos uma rotina visível
- incluir `Módulo` se houver ao menos um grupo ou rotina acessível

O frontend deve consumir a árvore final já resolvida ou dados suficientes para compô-la com segurança.

## 7. Super Admin

O módulo `Super Admin` será um módulo global da plataforma.

Ele não pertence à operação comum de um tenant.

Funções esperadas:

- administração sistêmica
- governança da plataforma
- manutenção de estruturas globais
- suporte operacional
- impersonação controlada de tenant

### 7.1 Impersonação

O `Super Admin` poderá operar com `impersonação controlada`.

Isso significa:

- entrar em contexto assistido de um tenant
- navegar e verificar comportamento
- apoiar diagnóstico e suporte

Restrições:

- a identidade original do operador global nunca deve ser perdida
- a troca de contexto deve ser explícita
- toda impersonação deve ser auditada
- a impersonação não deve ser bypass silencioso de segurança

## 8. Catálogo Funcional Global

Módulos, grupos, rotinas e ações pertencem à plataforma.

Isso implica:

- o catálogo funcional é `global`
- tenants não criam estruturas arbitrárias do produto
- tenants configuram quem acessa cada parte do catálogo

Esse catálogo pode ser combinado com:

- features do plano
- habilitações específicas do tenant
- regras de rollout

## 9. Modelo Conceitual de Entidades

### 9.1 Entidades globais

- `Module`
- `MenuGroup`
- `Routine`
- `RoutineAction`
- `FeatureFlag`

### 9.2 Entidades por tenant

- `Profile`
- `ProfileRoutineGrant`
- `ProfileActionGrant`
- `UserProfile`
- `UserRoutineOverride`
- `UserActionOverride`

### 9.3 Finalidade das entidades

`Module`
- representa o domínio principal

`MenuGroup`
- organiza visualmente as rotinas

`Routine`
- representa a entrada navegável

`RoutineAction`
- representa as operações internas da rotina

`Profile`
- representa o conjunto reutilizável de acesso

`ProfileRoutineGrant`
- indica quais rotinas o perfil pode acessar

`ProfileActionGrant`
- indica quais ações o perfil pode executar

`UserProfile`
- vincula usuário a perfil

`UserRoutineOverride`
- concede ou bloqueia rotina no nível individual

`UserActionOverride`
- concede ou bloqueia ação no nível individual

## 10. Resolução de Permissão

A autorização deve seguir uma ordem determinística.

Ordem recomendada:

1. catálogo funcional global
2. features habilitadas para o tenant
3. rotinas e ações concedidas pelos perfis
4. overrides individuais do usuário
5. escopo organizacional aplicável

O resultado final da autorização deve ser a interseção entre:

- o que existe na plataforma
- o que está habilitado para o tenant
- o que o usuário herdou por perfil
- o que foi ajustado individualmente
- o que o escopo permite operar

## 11. Relação com Escopo Organizacional

Esse modelo não substitui o `RBAC + escopo` já definido.

Ele o complementa.

Separação conceitual:

- `rotina` decide se o usuário entra na funcionalidade
- `ação` decide o que ele pode fazer nela
- `escopo` decide sobre quais registros ou áreas ele pode operar

Exemplo:

- usuário pode acessar `Cadastro de Pessoas`
- pode `editar`
- mas só dentro da unidade ou carteira autorizada

## 12. APIs Esperadas

Conjunto funcional mínimo esperado:

- `GET /me/menu`
- `GET /me/permissions`
- `GET /admin/profiles`
- `POST /admin/profiles`
- `PUT /admin/profiles/:id/routines`
- `PUT /admin/profiles/:id/actions`
- `PUT /admin/users/:id/profiles`
- `PUT /admin/users/:id/overrides`
- `POST /super-admin/impersonation/start`
- `POST /super-admin/impersonation/stop`

## 13. Regras Obrigatórias

Regras mínimas:

- menu deve ser derivado de rotina, não de ação
- ação não deve aparecer isolada sem rotina associada
- overrides individuais devem ser auditados
- impersonação deve ser sempre explícita e auditada
- catálogo funcional deve ser global
- tenant não deve alterar arbitrariamente a estrutura funcional do produto

## 14. Impactos Técnicos

Esse modelo afeta diretamente:

- autenticação e resolução de sessão
- autorização de backend
- renderização do menu no frontend
- administração de usuários e perfis
- módulo `Super Admin`
- governança de features por tenant

Também exige:

- endpoints de menu dinâmico
- endpoints de governança de acesso
- auditoria de grants, revogações e impersonação

## 15. Gap Analysis

Definido:

- modelo híbrido de autorização
- hierarquia `Módulo > Grupo > Rotina > Ação`
- menu baseado em rotina
- ação como refinamento operacional
- perfis como base principal
- exceções por usuário
- `Super Admin` global com impersonação controlada

Ainda em aberto:

- modelo físico exato das tabelas
- contrato final da API de menu
- precedência detalhada entre allow/deny em overrides
- política de cache do menu por sessão
- catálogo inicial de módulos, grupos, rotinas e ações

## 16. Próximos Passos Recomendados

1. Detalhar o modelo lógico do banco para acesso dinâmico.
2. Especificar o contrato da API de menu.
3. Integrar esse modelo à especificação principal da plataforma.
4. Gerar plano de implementação do módulo de acesso.
