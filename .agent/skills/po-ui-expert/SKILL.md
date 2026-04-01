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

## 🔄 Fluxo de Migração (Legacy Code)

Ao converter código de sistemas legados (como o Adianti PHP encontrado no projeto):
1.  **Analise o SQL**: Identifique os campos e seus tipos.
2.  **Mapeie para PO-UI**: Use o script `scripts/converter.py` para sugerir o componente ideal.
3.  **Crie o Serviço**: Gere um serviço Angular que siga o padrão REST da TOTVS (com paginação e ordenação via query parameters).

---
*Para mais detalhes de componentes específicos, consulte `references/components.md`.*
