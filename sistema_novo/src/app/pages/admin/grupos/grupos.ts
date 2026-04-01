import { Component } from '@angular/core';
import { PoPageDynamicTableModule, PoPageDynamicTableField } from '@po-ui/ng-templates';

@Component({
  selector: 'app-grupos',
  standalone: true,
  imports: [PoPageDynamicTableModule],
  template: `
    <po-page-dynamic-table
      p-title="Grupos e Perfis de Acesso"
      [p-fields]="fields"
      p-service-api="/api/v1/groups"
    >
    </po-page-dynamic-table>
  `
})
export class Grupos {
  readonly fields: Array<PoPageDynamicTableField> = [
    { property: 'id', key: true, label: 'ID', filter: true, width: '70px' },
    { property: 'nome', label: 'Nome do Grupo', filter: true },
    { property: 'descricao', label: 'Descrição' },
    { property: 'status', label: 'Status', type: 'label', filter: true, options: [
      { value: 'A', label: 'Ativo', color: 'color-11' },
      { value: 'I', label: 'Inativo', color: 'color-07' }
    ]}
  ];
}
