# Especificação do Módulo Geográfico Global

Data: 2026-06-16
Status: Rascunho validado em colaboração

## 1. Objetivo

Criar um módulo geográfico global da plataforma para manter `estados`, `municípios` e `CEPs`, com uso compartilhado por todos os tenants e integração direta com o bloco de endereços do cadastro de pessoas.

O objetivo do módulo é:

- normalizar dados geográficos oficiais
- reduzir preenchimento manual de endereço
- apoiar autocomplete por CEP
- permitir relacionamento consistente com `PessoaEndereco`
- preservar histórico textual do endereço informado

## 2. Posicionamento na Plataforma

O módulo geográfico será um `catálogo global da plataforma`, e não um catálogo por tenant.

Consequências dessa decisão:

- os dados não terão `tenant_id`
- estados, municípios e CEPs existirão uma única vez na base
- todos os tenants reutilizarão o mesmo catálogo
- a governança do catálogo ficará com a camada global da plataforma

O tenant apenas consome esses dados no cadastro de endereços; ele não é dono da malha geográfica oficial.

## 3. Fontes de Verdade

O módulo terá duas fontes com papéis distintos:

- `IBGE` como fonte oficial para estados e municípios
- `ViaCEP` como serviço operacional para resolução de CEP

### 3.1 IBGE

Responsável por:

- catálogo oficial de estados
- catálogo oficial de municípios
- identificadores externos oficiais
- estrutura administrativa confiável

### 3.2 ViaCEP

Responsável por:

- busca operacional de endereço por CEP
- preenchimento assistido de logradouro e bairro
- apoio à experiência do usuário no cadastro

O ViaCEP não será a fonte de verdade primária para estado e município. Esses vínculos devem apontar para o catálogo oficial derivado do IBGE.

## 4. Papel do CEP no Primeiro Ciclo

No primeiro ciclo, o `CEP` terá papel de:

- referência cadastral
- apoio a autocomplete
- base de cache progressivo local

O sistema não precisa importar todos os CEPs do Brasil logo no início. Em vez disso, a plataforma pode registrar localmente os CEPs consultados com sucesso via ViaCEP, formando uma base própria gradual para reuso futuro.

## 5. Modelo Conceitual

O módulo será composto pelas seguintes entidades globais:

- `State`
- `City`
- `ZipCode`

E se relacionará com a entidade de domínio do tenant:

- `PersonAddress`

### 5.1 State

Representa a unidade federativa oficial.

Campos conceituais mínimos:

- `state_id`
- `ibge_code`
- `code`
- `name`
- `status`
- `created_at`
- `updated_at`

Exemplos:

- `code`: `SP`, `RJ`, `MT`
- `ibge_code`: código oficial da UF

### 5.2 City

Representa o município oficial.

Campos conceituais mínimos:

- `city_id`
- `state_id`
- `ibge_code`
- `name`
- `normalized_name`
- `status`
- `created_at`
- `updated_at`

Regras:

- todo município pertence a um estado
- o código IBGE do município deve ser preservado
- `normalized_name` pode ser usado para busca e conciliação

### 5.3 ZipCode

Representa a referência operacional do CEP.

Campos conceituais mínimos:

- `zipcode_id`
- `zipcode`
- `state_id`
- `city_id`
- `street`
- `district`
- `complement`
- `source`
- `last_resolved_at`
- `is_active`
- `created_at`
- `updated_at`

Regras:

- um CEP pode ser carregado sob demanda
- o vínculo com estado e município deve tentar apontar para o catálogo oficial
- `source` deve registrar origem, como `viacep`

## 6. Relacionamento com PessoaEndereco

O módulo geográfico impacta diretamente o cadastro de pessoas, introduzindo um relacionamento formal para o bloco de endereços.

`PersonAddress` deve armazenar:

- chaves relacionais para o catálogo global
- snapshot textual do endereço no momento do cadastro

### 6.1 Chaves relacionais

Campos relacionais esperados:

- `state_id`
- `city_id`
- `zipcode_id`

### 6.2 Snapshot textual

Campos textuais esperados:

- `zipcode_value`
- `street`
- `number`
- `complement`
- `district`
- `city_name`
- `state_code`
- `country_name`
- `reference`

### 6.3 Motivo do modelo híbrido

Esse desenho preserva:

- integridade relacional
- histórico do que foi realmente informado
- resiliência contra alterações futuras em bases externas
- consistência de exibição em documentos e auditoria

## 7. Fluxos Funcionais

O endereço pode ser criado de duas formas:

- preenchimento manual
- busca assistida por CEP

### 7.1 Fluxo por CEP

Fluxo esperado:

1. usuário informa o CEP
2. sistema consulta o cache local
3. se não encontrar, consulta o ViaCEP
4. sistema tenta vincular `UF + município` ao catálogo oficial
5. campos são sugeridos para confirmação
6. endereço é salvo com chaves + snapshot

### 7.2 Fluxo manual

Se a resolução automática falhar:

- o usuário pode informar manualmente o endereço
- o sistema pode salvar o snapshot textual
- o vínculo relacional pode ficar incompleto temporariamente
- a pendência de normalização pode ser tratada depois

## 8. Estratégia de Carga e Atualização

### 8.1 Carga IBGE

Estados e municípios devem ser carregados por rotina administrativa da plataforma.

Características:

- carga inicial obrigatória
- atualização controlada
- execução fora do fluxo do tenant
- possibilidade de reprocessamento por código oficial

### 8.2 Cache de CEP

CEPs podem ser salvos sob demanda conforme consultas reais.

Benefícios:

- reduz chamadas repetidas ao ViaCEP
- acelera preenchimento futuro
- cria base própria operacional
- permite uso local mesmo com falha eventual do serviço externo

### 8.3 Atualizações

Mudanças futuras no catálogo global não devem reescrever snapshots históricos de endereços já utilizados por pessoas.

## 9. APIs Esperadas

O módulo passa a exigir APIs globais de consulta geográfica.

Conjunto mínimo esperado:

- `GET /geo/states`
- `GET /geo/states/:stateId/cities`
- `GET /geo/cities/search`
- `GET /geo/zipcodes/:zipcode`
- `POST /geo/zipcodes/resolve`

Possíveis APIs administrativas futuras:

- `POST /admin/geo/ibge/import`
- `POST /admin/geo/ibge/sync`
- `POST /admin/geo/zipcodes/reprocess`

## 10. Permissões

O consumo do catálogo deve ser amplamente permitido aos usuários do backoffice autorizados a manter endereço de pessoas.

Permissões funcionais esperadas:

- `geo.read`
- `geo.zipcode.resolve`

Permissões administrativas globais esperadas:

- `geo.admin.import`
- `geo.admin.sync`
- `geo.admin.reprocess`

O portal externo, neste momento, não precisa administrar o catálogo geográfico.

## 11. Regras de Modelagem

Regras obrigatórias:

- `State`, `City` e `ZipCode` não possuem `tenant_id`
- `City` deve sempre pertencer a um `State`
- `ZipCode` deve apontar para `State` e `City` quando a resolução for confiável
- `PersonAddress` deve possuir `tenant_id`
- `PersonAddress` deve guardar chaves + snapshot textual
- snapshots históricos não devem ser sobrescritos por atualização de catálogo

## 12. Impactos Técnicos

Impactos diretos:

- criação de novo subdomínio global no backend
- criação de novas tabelas globais
- criação de rotina de importação IBGE
- integração com ViaCEP
- implementação real da entidade `PersonAddress`
- ajuste do cadastro de pessoas para suportar endereços relacionais

## 13. Gap Analysis

Definido:

- catálogo geográfico global
- IBGE como fonte oficial de estados e municípios
- ViaCEP como resolvedor operacional de CEP
- `PersonAddress` com chaves + snapshot
- cache progressivo local de CEP
- uso compartilhado por todos os tenants

Ainda em aberto:

- formato físico exato das tabelas
- política de importação inicial do IBGE
- estratégia de cache e expiração do CEP
- regras de normalização de município em divergências de escrita
- se o portal externo usará autocomplete de CEP em fase futura

## 14. Próximos Passos Recomendados

1. Atualizar a especificação principal com referência ao módulo geográfico.
2. Detalhar o modelo lógico do banco para `State`, `City`, `ZipCode` e `PersonAddress`.
3. Quebrar o módulo em plano de implementação.
4. Definir a estratégia de carga IBGE e o contrato da integração com ViaCEP.
