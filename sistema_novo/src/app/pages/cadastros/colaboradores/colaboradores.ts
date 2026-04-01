import { Component } from '@angular/core';
import { PoPageDynamicTableModule, PoPageDynamicTableField } from '@po-ui/ng-templates';

@Component({
  selector: 'app-colaboradores',
  standalone: true,
  imports: [PoPageDynamicTableModule],
  template: `
    <po-page-dynamic-table
      p-title="Listagem de Colaboradores"
      [p-fields]="fields"
      p-service-api="/api/v1/colaboradores"
    >
    </po-page-dynamic-table>
  `
})
export class Colaboradores {
  readonly fields: Array<PoPageDynamicTableField> = [
    { property: 'id', key: true, label: 'ID', filter: true, width: '70px' },
    { property: 'nome', label: 'Nome Completo', filter: true },
    { property: 'email', label: 'E-mail', filter: true },
    { property: 'telefone', label: 'Telefone' },
    { property: 'matricula', label: 'Matrícula', filter: true },
    { property: 'status', label: 'Status', type: 'label', filter: true, options: [
      { value: 'A', label: 'Ativo', color: 'color-11' },
      { value: 'I', label: 'Inativo', color: 'color-07' }
    ]}
  ];
}
