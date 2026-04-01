# Regras de Design e UX PO-UI Expert

Estas regras devem ser aplicadas em todos os componentes gerados pelo Antigravity para garantir conformidade com o Design System da TOTVS.

## 🎨 Cores e Estilo

1.  **Consistência de Status**:
    *   Sucesso/Ativo: `color-11` (Verde)
    *   Erro/Cancelado: `color-07` (Vermelho)
    *   Aviso/Pendente: `color-08` (Amarelo)
    *   Informação/Neutro: `color-01` (Cinza)

2.  **Purple Ban**:
    *   Não utilize tons de violeta, roxo ou lilás em elementos de interface, a menos que solicitado explicitamente pelo design da marca. O PO-UI utiliza tons de azul e cinza por padrão.

## 📐 Layout e Responsividade

1.  **Grid columns**:
    *   Sempre defina `gridColumns` em formulários dinâmicos.
    *   Padrão Desktop: `6` ou `4` colunas.
    *   Padrão Mobile: `12` colunas.

2.  **Páginas**:
    *   CRUDs de Listagem -> `po-page-list`.
    *   CRUDs de Edição/Criação -> `po-page-edit`.
    *   Visualização de Detalhes -> `po-page-detail`.

## ♿ Acessibilidade

1.  **Labels**: Todo campo deve ter um `p-label`. Nunca use apenas o placeholder como descrição.
2.  **Foco**: Manter a ordem de tabulação natural do formulário.
3.  **Contraste**: Seguir os tokens oficiais do PO-UI que já garantem contraste WCAG.

## 🧼 Clean Code (Angular + PO-UI)

1.  **Tipagem Estrita**: Sempre use interfaces do `@po-ui/ng-components`. Evite `any`.
2.  **Deserização de Enums**: Mapeie valores numéricos do banco de dados para labels amigáveis no frontend usando a propriedade `labels` da `PoTableColumn`.
3.  **Serviços**: Os serviços devem estender um `BaseService` ou seguir o padrão de injeção de dependência para chamadas HTTP consistentes.
