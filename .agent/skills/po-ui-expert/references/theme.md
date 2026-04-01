# Estilização e Tema (PoTheme)

Este documento descreve as melhores práticas para estilização visual seguindo o padrão oficial da TOTVS.

## 🎨 Cores Institucionais (Design Tokens)

Sempre prefira usar variáveis CSS do `po-theme` em vez de valores hexadecimais:

| Token | Finalidade | Exemplo |
| :--- | :--- | :--- |
| `--po-color-primary` | Cor principal da marca | `background-color: var(--po-color-primary);` |
| `--po-color-secondary` | Cor de destaque secundário | `border: 1px solid var(--po-color-secondary);` |
| `--po-color-tertiary` | Cor terciária | `color: var(--po-color-tertiary);` |

### Status Colors (Feedback)
- **Sucesso**: `--po-color-feedback-positive` (`color-11`)
- **Erro**: `--po-color-feedback-negative` (`color-07`)
- **Aviso**: `--po-color-feedback-warning` (`color-08`)
- **Info**: `--po-color-feedback-info` (`color-01`)

## 📐 Classes Utilitárias de Layout

Evite criar CSS customizado para margem e preenchimento. Use as classes nativas:

- `po-m-1`, `po-m-2` (Margem)
- `po-p-1`, `po-p-2` (Padding/Preenchimento)
- `po-mt-1` (Margem Superior), `po-mb-1` (Margem Inferior)

## 🖥️ Layout Protheus (MDI)

Ao desenvolver para o MDI Protheus:
1.  **Grid columns**: Use layouts compactos de 12 colunas.
2.  **Densidade**: Evite grandes espaços em branco; o usuário Protheus está acostumado a layouts densos de dados.
3.  **Componentes**: Prefira usar `PoPageDefault` com campos agrupados para melhor leitura.

## 🏁 Variáveis de Tipografia
- `--po-font-family`: Fonte padrão (`Inter` ou `Roboto`).
- `--po-font-size`: Tamanho base (`14px`).
