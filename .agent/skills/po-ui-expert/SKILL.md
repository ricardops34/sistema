---
name: po-ui-expert
description: Especialista em PO-UI (TOTVS) para Angular. Provê diretrizes de design, snippets de componentes e auxílio na migração de sistemas legados para PO-UI.
---

# PO-UI Expert Skill

Esta Skill especializa o agente Antigravity na criação e manutenção de interfaces ricas usando o framework **PO-UI** (TOTVS) com **Angular**.

## 🚀 Como Usar Esta Skill

Quando esta Skill for carregada, o agente deve seguir rigorosamente as regras de design e implementação da TOTVS.

### Princípios de Design
1.  **Prefixos p-**: Todas as propriedades de componentes PO-UI devem usar o prefixo `p-` (ex: `p-label`, `p-type`).
2.  **Grid System**: Use preferencialmente o grid do PO-UI (`po-row` e `po-column`) para layouts responsivos.
3.  **Purple Ban**: Siga o guia visual da TOTVS. Evite o uso de cores vibrantes fora da paleta (especialmente roxo, a menos que aprovado).

## 🛠️ Recomendações Técnicas

### Componentes de Dados
- **PoTable**: Use para listagens complexas. Prefira definir colunas via `PoTableColumn[]` no TypeScript.
- **PoDynamicForm**: Use para formulários simples onde a produtividade é prioridade.
- **PoLookup**: Sempre use para campos de busca em tabelas externas (Foreign Keys).

### Arquitetura (Smart/Dumb)
- Separe componentes de visualização (`Dumb`) de componentes de lógica de negócio (`Smart`).
- Utilize **Reactive Forms** para formulários complexos que exigem validações customizadas.

## 🔄 Fluxo de Migração & Integração (Legacy/Protheus)

1.  **Analise o SQL**: Identifique os campos e seus tipos (ex: `A1_COD`).
2.  **Mapeie para PO-UI**: Use o script `scripts/converter.py` para sugerir o componente ideal.
3.  **Crie o Serviço Protheus**: Gere serviços Angular integrando com `protheus-lib-core` para manter padrões de comunicação ADVPL.
4.  **Acesse o MDI**: Use as bibliotecas Protheus para abrir rotinas externas e gerenciar o fechamento de abas.

## 🎨 Estilização & Tema

- **PoTheme**: Utilize o tema institucional TOTVS (`po-theme-default` ou `po-theme-protheus`).
- **CSS Customization**: Prefira usar variáveis do Design System (`--po-color-*`) em vez de cores estáticas.
- **Tokens de Espaçamento**: Utilize as classes utilitárias de margem e preenchimento (`po-m-1`, `po-p-2`, etc.) para manter a consistência visual.

---
*Para mais detalhes técnicos, consulte:*
- [Componentes](file:///c:/Ricardo/Sistema/.agent/skills/po-ui-expert/references/components.md)
- [Padrões Protheus](file:///c:/Ricardo/Sistema/.agent/skills/po-ui-expert/references/protheus.md)
- [Design e Tema](file:///c:/Ricardo/Sistema/.agent/skills/po-ui-expert/references/theme.md)
- [Regras de Design](file:///c:/Ricardo/Sistema/.agent/skills/po-ui-expert/references/rules.md)
