# Especificação de Sistema SaaS Multi-tenant

Data: 2026-06-16
Status: Rascunho validado em colaboração

## 1. Visão do Produto

O sistema será uma plataforma SaaS multi-tenant com banco compartilhado e isolamento lógico por `tenant_id`. Cada tenant representa uma operação independente, com dados, usuários, permissões, branding e configurações próprias.

O produto terá alto grau de white-label, permitindo que cada tenant personalize identidade visual, nomenclaturas, parâmetros operacionais, campos configuráveis e regras de cadastro, preservando uma base comum de plataforma.

O canal principal será dividido entre:

- Backoffice web para usuários internos do tenant
- Portal externo separado para usuários externos autorizados

O MVP não implementará ainda módulos operacionais como chamados, ordens de serviço, agendamentos ou contratos. O primeiro módulo concreto será o `Cadastro de Pessoas`, pensado como domínio mestre para suportar a expansão futura do produto.

## 2. Escopo do MVP

O MVP validará a fundação da plataforma, com foco nas seguintes capacidades:

- Isolamento multi-tenant por `tenant_id`
- Administração global da plataforma
- Administração por tenant
- White-label avançado
- Autenticação e autorização com `RBAC + escopo`
- Cadastro mestre de pessoas
- Portal externo com acesso controlado
- Onboarding guiado de novos tenants

O sucesso da primeira fase será medido pela robustez da base da plataforma, não pela quantidade de módulos de negócio entregues.

## 3. Modelo Multi-tenant

O modelo adotado será:

- Banco compartilhado
- Tabelas compartilhadas
- Segregação lógica obrigatória por `tenant_id`

O `tenant_id` será obrigatório em toda entidade de negócio, configuração, auditoria e integração pertencente ao tenant. Nenhuma operação de leitura ou escrita deve ocorrer sem contexto de tenant resolvido.

O isolamento deve existir em quatro camadas:

- Identidade: sessão resolve tenant ativo, usuário, papéis e escopos
- Aplicação: serviços validam tenant corrente em toda operação
- Persistência: queries e repositórios filtram sempre por `tenant_id`
- Auditoria: eventos registram tenant, usuário, ação e dados afetados

## 4. Governança e Atores

Haverá dois níveis de operação:

- Nível global: provedor SaaS + equipe interna de operações
- Nível do tenant: administração e operação interna de cada cliente

Perfis principais:

- Administrador global
- Operador global
- Administrador do tenant
- Usuário interno do tenant
- Usuário externo do portal

O nível global administra criação de tenants, planos, limites, features, onboarding, suporte e auditoria. O nível do tenant administra usuários, branding, parâmetros, regras cadastrais e permissões internas.

## 5. White-label e Configuração

O produto deverá suportar white-label alto, incluindo:

- Logo, cores e identidade visual
- Rótulos e nomenclaturas
- Features habilitadas por tenant
- Campos configuráveis
- Visibilidade por bloco/campo
- Regras de obrigatoriedade
- Tipos de documentos
- Contextos de códigos informativos

A customização será orientada por configuração e metadata, não por ramificações de código por cliente.

## 6. Integrações

O produto terá alta dependência de integrações externas. O MVP deve nascer preparado para suportar por tenant:

- Credenciais
- Endpoints
- Chaves e segredos
- Webhooks
- Regras de sincronização
- Templates globais reutilizáveis

As integrações não precisam estar implementadas integralmente no MVP, mas sua governança deve estar prevista desde o desenho inicial.

## 7. Segurança e Auditoria

Os pilares de segurança são:

- Autenticação confiável
- Autorização por `RBAC + escopo`
- Segregação obrigatória por `tenant_id`
- Auditoria forte

Toda ação sensível deve ser auditada. Operações administrativas globais críticas, como impersonação, suporte assistido ou alterações estruturais de configuração, devem exigir autorização explícita e trilha completa.

## 8. Módulo Inicial: Cadastro de Pessoas

O primeiro módulo de negócio será o `Cadastro de Pessoas`, funcionando como cadastro mestre do tenant.

Objetivos do módulo:

- Criar, editar, consultar, listar, inativar e bloquear pessoas
- Pesquisar por código, nome, documento, e-mail, telefone e tags
- Manter contatos, endereços, documentos, observações, anexos e campos customizados
- Servir de base para módulos futuros

A pessoa existirá apenas no contexto do tenant ao qual pertence. Não haverá compartilhamento de pessoa entre tenants.

## 9. Identificação da Pessoa

Cada pessoa terá duas camadas de identificação:

- `Código interno do sistema`
- `Códigos informativos por contexto`

### 9.1 Código interno do sistema

Características:

- Gerado automaticamente
- Único por tenant
- Imutável
- Principal referência técnica e operacional da plataforma

Esse código não depende de documento nem carrega significado funcional obrigatório.

### 9.2 Códigos informativos por contexto

Uma mesma pessoa poderá possuir múltiplos códigos informativos, cada um vinculado a um contexto de negócio configurado pelo tenant.

Exemplos:

- Código de cliente
- Código de vendedor
- Código de fornecedor
- Código de parceiro

No MVP, esses contextos geram apenas identificação operacional. Eles não criam perfil funcional ou comportamento específico.

## 10. Regras de Criação e Qualidade Cadastral

O cadastro deve permitir criação rápida com exigências funcionais configuráveis por tenant.

O produto manterá um baseline técnico mínimo:

- `tenant_id`
- `pessoa_id`
- `código interno`
- auditoria básica
- integridade estrutural

Fora isso, o tenant poderá configurar:

- Campos obrigatórios na criação
- Campos obrigatórios no enriquecimento
- Regras por fluxo de cadastro
- Políticas documentais

O sistema deve distinguir claramente:

- Registro criado
- Registro aderente às regras do tenant
- Registro completo

## 11. Modelo Conceitual de Dados do Cadastro de Pessoas

Entidades principais previstas:

- `Pessoa`
- `PessoaContato`
- `PessoaEndereco`
- `PessoaDocumento`
- `PessoaTag`
- `PessoaObservacao`
- `PessoaAnexo`
- `PessoaCodigoContexto`
- `PessoaStatus`
- `PessoaCampoCustomizado`
- `PessoaCampoValor`

### 11.1 Pessoa

Campos conceituais mínimos:

- `tenant_id`
- `pessoa_id`
- `codigo_interno`
- `tipo_pessoa`
- `nome_razao`
- `nome_social`
- `nome_fantasia`
- `apelido`
- `status_atual`
- `origem_cadastro`
- `indicador_completude`
- `data_criacao`
- `usuario_criacao`
- `data_atualizacao`
- `usuario_atualizacao`

### 11.2 PessoaCodigoContexto

Campos conceituais mínimos:

- `tenant_id`
- `pessoa_id`
- `tipo_codigo_contexto`
- `codigo`
- `status`
- `principal`
- `data_inicio`
- `data_fim`
- `usuario_criacao`
- `usuario_atualizacao`

A unicidade do código informativo deverá ser tratada por `tenant + tipo_codigo_contexto + codigo`, conforme política do tenant.

### 11.3 PessoaDocumento

Campos conceituais mínimos:

- `tenant_id`
- `pessoa_id`
- `tipo_documento`
- `numero`
- `pais_emissor`
- `orgao_emissor`
- `data_emissao`
- `data_validade`
- `principal`
- `status_validacao`

### 11.4 PessoaContato

Campos conceituais mínimos:

- `tenant_id`
- `pessoa_id`
- `tipo_contato`
- `valor`
- `principal`
- `classificacao`
- `status`

### 11.5 PessoaEndereco

Campos conceituais mínimos:

- `tenant_id`
- `pessoa_id`
- `tipo_endereco`
- `logradouro`
- `numero`
- `complemento`
- `bairro`
- `cidade`
- `estado`
- `pais`
- `cep`
- `principal`

## 12. Status e Documentos

### 12.1 Status

O status cadastral será configurável por tenant. O produto deve oferecer um baseline inicial, mas permitir que cada tenant defina:

- Lista de status
- Regras de transição
- Visibilidade
- Ações permitidas por status

### 12.2 Documentos

A política documental também será configurável por tenant. Cada tenant poderá definir:

- Tipos de documento
- Obrigatoriedade
- Máscaras
- Duplicidade
- Nível de validação

O sistema deve distinguir:

- Documento armazenado
- Documento validado
- Documento pendente de validação

## 13. Duplicidade e Saneamento

O tratamento de duplicidade será configurável por tenant:

- Apenas alertar
- Bloquear a operação

Os critérios de comparação também serão configuráveis, podendo incluir:

- Nome ou razão social
- Documento
- E-mail
- Telefone
- Combinação de múltiplos atributos

O MVP não precisa implementar merge avançado, mas deve registrar eventos de duplicidade potencial e nascer preparado para saneamento futuro.

## 14. Portal Externo

No MVP, o portal externo poderá:

- Consultar dados autorizados
- Solicitar atualização cadastral

O portal externo não editará diretamente o cadastro mestre. Alterações propostas devem gerar uma estrutura própria, como `SolicitacaoAtualizacaoPessoa`, sujeita a análise e aprovação pelo backoffice do tenant.

Nem todos os dados do cadastro interno devem ser expostos no portal. A visibilidade deverá ser configurável por tenant e por perfil.

## 15. Anexos

No MVP, anexos existirão apenas no backoffice.

Características:

- Upload por usuários internos do tenant
- Controle por permissão
- Auditoria de upload, visualização e remoção
- Isolamento por tenant
- Estrutura desacoplada do cadastro principal

O portal externo não fará upload direto de anexos nesta fase.

## 16. Permissões no Módulo de Pessoas

O módulo de pessoas suportará:

- CRUD por papel
- Ações especiais
- Visibilidade por bloco
- Visibilidade por campo, quando aplicável

Ações especiais previstas:

- Alterar status
- Bloquear cadastro
- Gerenciar códigos por contexto
- Aprovar solicitações externas
- Anexar arquivos
- Visualizar documentos sensíveis
- Tratar duplicidade
- Administrar metadata cadastral

As permissões funcionais sempre serão combinadas com escopo organizacional do usuário dentro do tenant.

## 17. Onboarding de Tenant

O onboarding será suportado por um assistente de configuração.

Esse assistente deverá contemplar:

- Dados institucionais do tenant
- Branding inicial
- Usuário administrador inicial
- Features do plano
- Políticas do cadastro de pessoas
- Tipos de documento
- Política de duplicidade
- Contextos de códigos informativos
- Parâmetros iniciais do portal externo

A equipe global poderá acompanhar, retomar, corrigir e concluir o onboarding quando necessário.

## 18. Arquitetura Técnica

### 18.1 Stack definida

- Frontend: Angular com `PO-UI`
- Backend: `Node.js` com `NestJS`
- Banco transacional: `PostgreSQL`

### 18.2 Componentes lógicos

Arquitetura lógica proposta:

- Backoffice Web
- Portal Externo Web
- API principal de negócio
- Serviço de identidade e autorização
- Serviço de configuração e metadata
- Serviço de auditoria
- Serviço de arquivos
- Módulo de integrações
- Processamento assíncrono por filas

### 18.3 Frontend

O frontend do backoffice e do portal externo deverá usar Angular com `PO-UI`, preservando consistência visual, produtividade e capacidade de personalização controlada.

Separações recomendadas:

- Aplicação ou shell de backoffice
- Aplicação ou shell de portal externo
- Biblioteca compartilhada de componentes base
- Biblioteca compartilhada de autenticação, autorização e contexto de tenant
- Biblioteca de integração com metadata de white-label

### 18.4 Backend

O backend em NestJS deverá ser organizado por domínios e capacidades transversais.

Módulos iniciais sugeridos:

- `auth`
- `tenants`
- `users`
- `roles-permissions`
- `tenant-settings`
- `people`
- `people-metadata`
- `people-requests`
- `attachments`
- `audit`
- `integrations`
- `onboarding`

Capacidades transversais obrigatórias:

- Resolução do contexto de tenant
- Resolução de escopo do usuário
- Guards de autenticação e autorização
- Interceptadores de auditoria
- Estratégia de filtro obrigatório por tenant
- Validação de metadata configurável

### 18.5 Persistência

O banco principal será PostgreSQL compartilhado entre tenants.

Diretrizes:

- Toda tabela de negócio e configuração de tenant deve possuir `tenant_id`
- Índices compostos devem considerar `tenant_id` como parte da chave de acesso
- Chaves únicas devem ser definidas por tenant quando aplicável
- Auditoria deve ser armazenada de forma estruturada
- Arquivos devem ficar fora do banco transacional, com metadados referenciados pela aplicação

### 18.6 Processamento assíncrono

Devem ser assíncronas, quando aplicável:

- Integrações externas
- Geração e envio de notificações
- Validações mais pesadas
- Rotinas de saneamento cadastral
- Processos de importação

Isso reduz acoplamento entre uso interativo e operações demoradas.

### 18.7 Segurança técnica

Diretrizes obrigatórias:

- Token autenticado com contexto mínimo necessário
- Autorização por papel e escopo
- Segregação de tenant em toda camada de persistência
- Segredos armazenados de forma segura
- Auditoria de impersonação e ações administrativas globais
- Observabilidade por tenant e por recurso sensível

## 19. Decisões Consolidadas

- Modelo multi-tenant: tabelas compartilhadas com `tenant_id`
- Produto: SaaS novo
- Canal: backoffice web + portal externo separado
- White-label: alto
- Integrações: dependência alta
- Autorização: `RBAC + escopo`
- Módulo inicial: cadastro de pessoas
- Pessoa: única dentro de cada tenant
- Identificador principal: código interno automático
- Códigos informativos: múltiplos por contexto configurável por tenant
- Contextos informativos: apenas identificação operacional no MVP
- Campos obrigatórios: configuráveis por tenant
- Documentos: configuráveis por tenant
- Duplicidade: alerta ou bloqueio configurável por tenant
- Portal externo: consulta e solicitação de atualização
- Anexos: apenas backoffice
- Onboarding: assistente de configuração
- Stack: Angular + PO-UI, NestJS, PostgreSQL

## 20. Pontos Abertos

Itens ainda não fechados:

- Estratégia exata de autenticação
- Catálogo inicial de features e planos
- Modelo de storage e retenção de anexos
- Catálogo inicial de permissões do produto
- Estratégia de observabilidade e suporte operacional
- Políticas de versionamento de metadata
- Regras de importação inicial de dados

## 21. Próximos Passos Recomendados

1. Fechar autenticação, sessões e suporte a múltiplos usuários externos.
2. Detalhar o modelo lógico do banco inicial do MVP.
3. Especificar APIs e contratos do módulo de pessoas.
4. Desenhar jornadas do onboarding do tenant.
5. Definir backlog da primeira entrega executável.

## 22. Modelo Lógico Inicial do Banco

O modelo lógico inicial do MVP deve separar claramente estruturas `globais da plataforma` das estruturas `pertencentes ao tenant`. Em PostgreSQL, a recomendação inicial é manter uma única base com tabelas compartilhadas e `tenant_id` obrigatório em todas as tabelas de domínio, configuração e auditoria do tenant.

Diretrizes estruturais:

- Chaves primárias técnicas com identificadores imutáveis
- `tenant_id` obrigatório em toda tabela do contexto do tenant
- `created_at`, `updated_at`, `created_by` e `updated_by` nas tabelas relevantes
- `status` ou `deleted_at` conforme necessidade de desativação lógica
- Índices compostos sempre iniciando por `tenant_id` nas consultas por tenant
- Restrições únicas definidas por tenant quando o dado não for global

### 22.1 Tabelas globais da plataforma

Estas tabelas não pertencem a um tenant específico:

- `platform_user`
- `platform_role`
- `platform_user_role`
- `plan`
- `feature`
- `plan_feature`
- `tenant`
- `tenant_plan`
- `tenant_feature_override`
- `tenant_onboarding`
- `audit_event_global`

#### 22.1.1 tenant

Tabela raiz da plataforma para cada cliente.

Campos principais:

- `tenant_id`
- `slug`
- `legal_name`
- `display_name`
- `status`
- `timezone`
- `locale`
- `primary_domain`
- `created_at`
- `updated_at`

Restrições sugeridas:

- `slug` único globalmente
- `primary_domain` único quando preenchido

#### 22.1.2 plan e feature

Estruturas para gestão comercial e funcional da plataforma.

`plan`:

- `plan_id`
- `code`
- `name`
- `status`
- `created_at`

`feature`:

- `feature_id`
- `code`
- `name`
- `category`
- `status`

`plan_feature`:

- `plan_id`
- `feature_id`
- `is_enabled`
- `limit_value`

#### 22.1.3 tenant_plan e tenant_feature_override

Permitem aplicar o plano contratado ao tenant e fazer exceções controladas.

`tenant_plan`:

- `tenant_plan_id`
- `tenant_id`
- `plan_id`
- `start_at`
- `end_at`
- `status`

`tenant_feature_override`:

- `tenant_feature_override_id`
- `tenant_id`
- `feature_id`
- `is_enabled`
- `limit_value`
- `reason`

#### 22.1.4 tenant_onboarding

Controla a jornada de ativação do tenant.

Campos principais:

- `tenant_onboarding_id`
- `tenant_id`
- `current_step`
- `status`
- `started_at`
- `completed_at`
- `last_actor_type`
- `last_actor_id`

### 22.2 Tabelas de identidade e acesso por tenant

Estas tabelas pertencem ao tenant e devem sempre carregar `tenant_id`:

- `tenant_user`
- `tenant_user_identity`
- `tenant_role`
- `tenant_permission`
- `tenant_role_permission`
- `tenant_user_role`
- `tenant_scope_type`
- `tenant_scope`
- `tenant_user_scope`

#### 22.2.1 tenant_user

Representa o usuário de negócio dentro do tenant.

Campos principais:

- `tenant_id`
- `tenant_user_id`
- `person_id`
- `status`
- `is_external`
- `display_name`
- `email`
- `last_login_at`
- `created_at`
- `updated_at`

Restrições sugeridas:

- unicidade de `email` por tenant quando preenchido

#### 22.2.2 tenant_role e tenant_permission

Catálogo de autorização interna do tenant.

`tenant_role`:

- `tenant_id`
- `tenant_role_id`
- `code`
- `name`
- `is_system`
- `status`

`tenant_permission`:

- `tenant_permission_id`
- `code`
- `resource`
- `action`
- `scope_type`

Observação:

- `tenant_permission` pode nascer como catálogo global sem `tenant_id`, mas para o MVP a especificação pode mantê-la desacoplada até a decisão final da arquitetura de autorização

#### 22.2.3 tenant_scope e tenant_user_scope

Sustentam o modelo `RBAC + escopo`.

`tenant_scope_type`:

- `tenant_id`
- `tenant_scope_type_id`
- `code`
- `name`

`tenant_scope`:

- `tenant_id`
- `tenant_scope_id`
- `tenant_scope_type_id`
- `code`
- `name`
- `parent_scope_id`
- `status`

`tenant_user_scope`:

- `tenant_id`
- `tenant_user_id`
- `tenant_scope_id`
- `granted_at`

### 22.3 Tabelas de configuração do tenant

Estruturas para white-label, metadata e políticas:

- `tenant_branding`
- `tenant_setting`
- `tenant_person_policy`
- `tenant_person_status`
- `tenant_person_status_transition`
- `tenant_person_document_type`
- `tenant_person_context_code_type`
- `tenant_custom_field`
- `tenant_custom_field_option`
- `tenant_field_rule`

#### 22.3.1 tenant_branding

Campos principais:

- `tenant_id`
- `logo_file_id`
- `primary_color`
- `secondary_color`
- `accent_color`
- `portal_theme`
- `backoffice_theme`
- `updated_at`

#### 22.3.2 tenant_person_policy

Centraliza políticas do módulo de pessoas.

Campos principais:

- `tenant_id`
- `duplicate_policy`
- `allow_quick_create`
- `external_update_policy`
- `default_visibility_policy`
- `updated_at`

#### 22.3.3 tenant_person_document_type

Define os tipos documentais aceitos por tenant.

Campos principais:

- `tenant_id`
- `tenant_person_document_type_id`
- `code`
- `name`
- `mask`
- `is_required`
- `allow_duplicates`
- `validation_level`
- `status`

#### 22.3.4 tenant_person_context_code_type

Define os contextos de código informativo.

Campos principais:

- `tenant_id`
- `tenant_person_context_code_type_id`
- `code`
- `name`
- `mask`
- `is_required`
- `is_unique`
- `allow_manual_edit`
- `status`

#### 22.3.5 tenant_custom_field e tenant_field_rule

Permitem customização de campos do cadastro.

`tenant_custom_field`:

- `tenant_id`
- `tenant_custom_field_id`
- `entity_name`
- `code`
- `label`
- `data_type`
- `is_active`

`tenant_field_rule`:

- `tenant_id`
- `tenant_field_rule_id`
- `entity_name`
- `field_code`
- `context`
- `is_required`
- `is_visible`
- `is_editable`

### 22.4 Tabelas do cadastro de pessoas

Estruturas centrais do MVP:

- `person`
- `person_contact`
- `person_address`
- `person_document`
- `person_context_code`
- `person_tag`
- `person_tag_link`
- `person_note`
- `person_attachment`
- `person_custom_field_value`
- `person_update_request`
- `person_update_request_item`

#### 22.4.1 person

Tabela mestre do cadastro.

Campos principais:

- `tenant_id`
- `person_id`
- `internal_code`
- `person_type`
- `name_legal`
- `name_display`
- `trade_name`
- `nickname`
- `current_status_id`
- `origin`
- `completeness_level`
- `created_at`
- `created_by`
- `updated_at`
- `updated_by`
- `deleted_at`

Restrições sugeridas:

- `internal_code` único por `tenant_id`

Índices sugeridos:

- `tenant_id + internal_code`
- `tenant_id + name_legal`
- `tenant_id + current_status_id`

#### 22.4.2 person_contact

Campos principais:

- `tenant_id`
- `person_contact_id`
- `person_id`
- `contact_type`
- `contact_value`
- `label`
- `is_primary`
- `is_active`

Índices sugeridos:

- `tenant_id + person_id`
- `tenant_id + contact_value`

#### 22.4.3 person_address

Campos principais:

- `tenant_id`
- `person_address_id`
- `person_id`
- `address_type`
- `street`
- `number`
- `complement`
- `district`
- `city`
- `state`
- `country`
- `postal_code`
- `is_primary`

#### 22.4.4 person_document

Campos principais:

- `tenant_id`
- `person_document_id`
- `person_id`
- `document_type_id`
- `document_number`
- `issuing_country`
- `issuing_authority`
- `issued_at`
- `expires_at`
- `is_primary`
- `validation_status`

Índices sugeridos:

- `tenant_id + person_id`
- `tenant_id + document_type_id + document_number`

#### 22.4.5 person_context_code

Campos principais:

- `tenant_id`
- `person_context_code_id`
- `person_id`
- `context_code_type_id`
- `code`
- `status`
- `is_primary`
- `start_at`
- `end_at`

Restrição sugerida:

- unicidade de `tenant_id + context_code_type_id + code` quando a política do contexto assim exigir

#### 22.4.6 person_tag e person_tag_link

Suportam categorização flexível.

`person_tag`:

- `tenant_id`
- `person_tag_id`
- `code`
- `name`
- `status`

`person_tag_link`:

- `tenant_id`
- `person_id`
- `person_tag_id`

#### 22.4.7 person_note

Campos principais:

- `tenant_id`
- `person_note_id`
- `person_id`
- `note_text`
- `visibility_type`
- `created_at`
- `created_by`

#### 22.4.8 person_attachment

Campos principais:

- `tenant_id`
- `person_attachment_id`
- `person_id`
- `storage_file_id`
- `attachment_type`
- `file_name`
- `mime_type`
- `file_size`
- `status`
- `created_at`
- `created_by`

#### 22.4.9 person_custom_field_value

Campos principais:

- `tenant_id`
- `person_custom_field_value_id`
- `person_id`
- `custom_field_id`
- `value_text`
- `value_number`
- `value_date`
- `value_boolean`
- `value_json`

#### 22.4.10 person_update_request e person_update_request_item

Sustentam as solicitações vindas do portal externo.

`person_update_request`:

- `tenant_id`
- `person_update_request_id`
- `person_id`
- `requester_user_id`
- `status`
- `requested_at`
- `reviewed_at`
- `reviewed_by`

`person_update_request_item`:

- `tenant_id`
- `person_update_request_item_id`
- `person_update_request_id`
- `field_name`
- `old_value`
- `new_value`
- `decision_status`

### 22.5 Tabelas de auditoria e suporte

Estruturas transversais do MVP:

- `audit_event`
- `integration_connection`
- `integration_secret_ref`
- `outbox_event`
- `stored_file`

#### 22.5.1 audit_event

Campos principais:

- `tenant_id`
- `audit_event_id`
- `actor_user_id`
- `actor_type`
- `resource_name`
- `resource_id`
- `action`
- `payload_before`
- `payload_after`
- `occurred_at`
- `ip_address`

#### 22.5.2 stored_file

Metadados de arquivos armazenados fora do banco transacional.

Campos principais:

- `stored_file_id`
- `storage_provider`
- `storage_bucket`
- `storage_key`
- `checksum`
- `created_at`

### 22.6 Relacionamentos principais

Relacionamentos centrais do MVP:

- `tenant 1:N tenant_user`
- `tenant 1:N tenant_role`
- `tenant 1:N tenant_scope`
- `tenant 1:1 tenant_branding`
- `tenant 1:N tenant_person_document_type`
- `tenant 1:N tenant_person_context_code_type`
- `tenant 1:N person`
- `person 1:N person_contact`
- `person 1:N person_address`
- `person 1:N person_document`
- `person 1:N person_context_code`
- `person 1:N person_note`
- `person 1:N person_attachment`
- `person 1:N person_custom_field_value`
- `person 1:N person_update_request`
- `person_update_request 1:N person_update_request_item`
- `tenant_user N:N tenant_role`
- `tenant_role N:N tenant_permission`
- `tenant_user N:N tenant_scope`
- `person N:N person_tag`

### 22.7 Regras de modelagem obrigatórias

Regras mínimas para a implementação do esquema:

- Nunca permitir chave de negócio sem isolamento por tenant nas tabelas do tenant
- Toda foreign key entre tabelas do tenant deve respeitar o mesmo `tenant_id`
- Tabelas de alta consulta devem ter índices compostos começando por `tenant_id`
- Estruturas configuráveis devem evitar alteração frequente de schema físico
- Auditoria e metadados de arquivos não substituem as tabelas de domínio

### 22.8 Pontos em aberto do modelo lógico

Itens que ainda dependem de decisão posterior:

- Estratégia final de `UUID`, `ULID` ou sequência para chaves técnicas
- Catálogo definitivo de permissões como tabela global ou por tenant
- Estratégia de soft delete por entidade
- Uso ou não de particionamento em tabelas de auditoria
- Estrutura final de suporte a usuários externos com identidade própria

## 23. Autenticação, Sessões e Usuários Externos

A estratégia de autenticação do produto deve separar claramente `identidade`, `vínculo com tenant` e `autorização operacional`. O objetivo é impedir que login, contexto de tenant e permissão de uso fiquem acoplados de forma rígida, o que dificultaria suporte a portal externo, usuários com acesso a mais de um tenant e governança global da plataforma.

### 23.1 Princípios da autenticação

Princípios obrigatórios:

- Uma identidade autenticável não é, por si só, uma permissão de uso
- O acesso efetivo depende de vínculo com tenant e status ativo
- A sessão sempre deve carregar tenant ativo, papéis e escopos resolvidos
- Backoffice e portal externo compartilham fundamentos de identidade, mas podem ter políticas próprias de login e experiência
- Operações globais e operações de tenant devem ser logicamente separadas

### 23.2 Modelo conceitual de identidade

O modelo recomendado para o MVP é composto por três níveis:

- `platform_identity`
- `tenant_user`
- `tenant_user_identity`

#### 23.2.1 platform_identity

Representa a identidade autenticável principal da plataforma.

Campos conceituais:

- `platform_identity_id`
- `login_name`
- `email`
- `password_hash`
- `password_salt`, se aplicável
- `auth_provider`
- `mfa_enabled`
- `status`
- `last_login_at`
- `created_at`
- `updated_at`

Função:

- centralizar autenticação
- permitir reaproveitamento controlado da mesma identidade em múltiplos tenants
- suportar usuários internos, operadores globais e, se desejado, usuários externos

#### 23.2.2 tenant_user

Representa o ator de negócio dentro do tenant. Ele não substitui a identidade; ele materializa o vínculo operacional com o tenant.

Campos conceituais relevantes:

- `tenant_id`
- `tenant_user_id`
- `person_id`
- `display_name`
- `email`
- `is_external`
- `status`
- `last_login_at`

Função:

- ser o usuário efetivo do domínio
- receber papéis e escopos
- separar acesso interno e externo por comportamento

#### 23.2.3 tenant_user_identity

Tabela de vínculo entre identidade autenticável e usuário do tenant.

Campos conceituais:

- `tenant_id`
- `tenant_user_identity_id`
- `tenant_user_id`
- `platform_identity_id`
- `is_primary`
- `linked_at`
- `status`

Função:

- permitir que uma identidade acesse um ou mais tenants
- permitir múltiplas estratégias de login sem duplicar o usuário de negócio
- desacoplar credencial de autorização

### 23.3 Tipos de usuário e canais

O produto deve tratar ao menos quatro categorias:

- usuário global da plataforma
- usuário interno do tenant
- administrador do tenant
- usuário externo do portal

Regras gerais:

- usuários globais autenticam no contexto administrativo da plataforma
- usuários internos autenticam para operar o backoffice do tenant
- usuários externos autenticam para acessar o portal externo do tenant
- o mesmo indivíduo pode existir em mais de uma categoria, mas os contextos de sessão devem continuar separados

### 23.4 Estratégia de login do MVP

Para o MVP, a estratégia recomendada é:

- autenticação principal por login e senha
- identidade centralizada na plataforma
- emissão de token de acesso de curta duração
- uso de refresh token com rotação
- suporte a logout com invalidação lógica de sessão

Essa abordagem é suficiente para a primeira entrega e deixa espaço para evoluções futuras, como `SSO`, provedores externos e autenticação federada por tenant.

### 23.5 Sessão e contexto de tenant

Toda sessão autenticada deve resolver explicitamente:

- identidade autenticada
- tenant ativo
- usuário efetivo no tenant
- tipo de canal (`backoffice` ou `portal`)
- papéis associados
- escopos aplicáveis

Campos mínimos sugeridos no token de acesso:

- `sub`
- `session_id`
- `tenant_id`
- `tenant_user_id`
- `channel`
- `roles`
- `scope_version`

Observações:

- o token não precisa carregar todos os detalhes de permissão fina
- permissões detalhadas podem ser resolvidas pela API a partir de cache e metadata
- o `scope_version` ajuda a invalidar autorizações após mudança relevante de acesso

### 23.6 Troca de tenant

O produto deve nascer preparado para identidades com acesso a múltiplos tenants, mesmo que isso não seja usado amplamente no primeiro ciclo.

Regras:

- a identidade autentica uma vez
- a sessão escolhe um tenant ativo
- a troca de tenant deve gerar novo contexto de autorização
- auditoria deve registrar o tenant escolhido e mudanças de contexto

Se a identidade tiver acesso a um único tenant, a seleção pode ser automática. Se tiver acesso a vários, o sistema deve apresentar seleção explícita após o login.

### 23.7 Usuários externos do portal

Usuários externos devem ser tratados como usuários de tenant com comportamento específico, e não como um sistema paralelo de identidade totalmente desvinculado.

Diretriz recomendada para o MVP:

- o usuário externo é um `tenant_user` com `is_external = true`
- sua autenticação usa a mesma base de identidade central
- suas permissões são restritas ao canal `portal`
- sua visibilidade de dados é governada por regras próprias do tenant

Vantagens:

- reduz duplicação estrutural
- simplifica auditoria
- facilita futura conversão de usuário externo em usuário interno, se necessário
- mantém consistência do modelo de segurança

### 23.8 Políticas de sessão

Políticas mínimas recomendadas:

- access token curto
- refresh token rotativo
- revogação de sessão por logout ou ação administrativa
- limite de sessões simultâneas configurável por política futura
- bloqueio por usuário inativo, removido ou sem vínculo válido com o tenant

Também deve existir registro estruturado de sessão, como uma tabela `auth_session`, com pelo menos:

- `auth_session_id`
- `platform_identity_id`
- `tenant_id`
- `tenant_user_id`
- `channel`
- `started_at`
- `expires_at`
- `revoked_at`
- `ip_address`
- `user_agent`

### 23.9 Recuperação de acesso

O MVP deve prever:

- redefinição de senha por fluxo seguro
- expiração de token de recuperação
- confirmação de alteração de senha
- bloqueio de credencial por status da identidade ou do vínculo com tenant

Para usuários externos do portal, o tenant poderá decidir se a recuperação é autônoma ou mediada por usuários internos.

### 23.10 MFA e autenticação avançada

`MFA` não precisa ser obrigatório no MVP, mas a arquitetura deve nascer preparada para:

- ativação futura por usuário
- ativação obrigatória por tenant
- exigência por perfil sensível, como administrador global ou administrador do tenant

### 23.11 Auditoria de autenticação

Eventos mínimos de auditoria:

- login bem-sucedido
- login mal-sucedido
- logout
- refresh de sessão
- troca de tenant
- redefinição de senha
- bloqueio ou revogação administrativa de acesso
- impersonação por usuário global autorizado

Esses eventos devem registrar data, origem, identidade, tenant afetado e canal utilizado.

### 23.12 Tabelas adicionais recomendadas

Além das estruturas já citadas, o modelo lógico deve prever:

- `platform_identity`
- `auth_session`
- `auth_refresh_token`
- `password_reset_request`
- `tenant_user_identity`

`auth_refresh_token`:

- `auth_refresh_token_id`
- `auth_session_id`
- `token_hash`
- `issued_at`
- `expires_at`
- `revoked_at`
- `rotated_from_id`

`password_reset_request`:

- `password_reset_request_id`
- `platform_identity_id`
- `token_hash`
- `requested_at`
- `expires_at`
- `used_at`
- `status`

### 23.13 Regras obrigatórias de segurança

Regras mínimas:

- nunca autenticar acesso apenas por e-mail e tenant sem identidade formal
- nunca derivar autorização apenas do token sem validação do vínculo com tenant
- nunca permitir sessão ativa após revogação do vínculo entre identidade e tenant
- nunca misturar permissões de backoffice e portal sem distinção de canal
- sempre auditar impersonação, troca de tenant e recuperação de acesso

### 23.14 Gap analysis da autenticação

Definido:

- autenticação centralizada com identidade da plataforma
- vínculo separado entre identidade e usuário do tenant
- suporte a múltiplos tenants por identidade
- usuários externos modelados como `tenant_user` específico do portal
- sessão com tenant ativo, papéis e escopos
- access token curto + refresh token rotativo

Ainda em aberto:

- algoritmo final de hash de senha
- necessidade de `SSO` já no primeiro ciclo
- política de MFA no MVP
- regras comerciais de auto cadastro de usuários externos
- política final de expiração e concorrência de sessões
