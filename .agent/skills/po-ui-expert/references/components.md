# Referência de Componentes PO-UI

Este documento serve como base de conhecimento para a geração de snippets consistentes.

## Table (`po-table`)

**HTML:**
```html
<po-table
  [p-columns]="columns"
  [p-items]="items"
  [p-loading]="isLoading"
  [p-actions]="actions">
</po-table>
```

**TypeScript:**
```typescript
import { PoTableAction, PoTableColumn } from '@po-ui/ng-components';

columns: PoTableColumn[] = [
  { property: 'id', label: 'ID', type: 'number' },
  { property: 'name', label: 'Nome' },
  { property: 'status', label: 'Status', type: 'label', labels: [
    { value: 'active', color: 'color-11', label: 'Ativo' },
    { value: 'inactive', color: 'color-07', label: 'Inativo' }
  ]}
];
```

## Page List (`po-page-list`)

**Estrutura padrão para telas de consulta:**
```html
<po-page-list
  p-title="Listagem"
  [p-actions]="actions"
  [p-filter]="filter">
  
  <po-table ...></po-table>

</po-page-list>
```

## Lookup (`po-lookup`)

**Uso para FKs (Foreign Keys):**
```html
<po-lookup
  name="customer"
  p-label="Cliente"
  [p-columns]="customerColumns"
  [p-field-format]="formatCustomer"
  p-field-label="name"
  p-field-value="id"
  [p-filter-service]="customerService">
</po-lookup>
```

## Dynamic Form (`po-dynamic-form`)

**Metadados:**
```typescript
fields: PoDynamicFormField[] = [
    { property: 'name', label: 'Nome Completo', divider: 'DADOS PESSOAIS', gridColumns: 6, required: true },
    { property: 'birthday', label: 'Data de Nascimento', type: 'date', gridColumns: 6 },
    { property: 'state', label: 'Estado', options: [ { label: 'Minas Gerais', value: 'MG' } ], gridColumns: 12 }
];
```
