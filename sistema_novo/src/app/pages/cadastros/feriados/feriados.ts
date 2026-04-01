import { Component } from '@angular/core';
import { PoPageDynamicTableModule, PoPageDynamicTableField } from '@po-ui/ng-templates';

@Component({
  selector: 'app-feriados',
  standalone: true,
  imports: [PoPageDynamicTableModule],
  template: `
    <po-page-dynamic-table
      p-title="Cadastro de Feriados"
      [p-fields]="fields"
      p-service-api="/api/v1/feriados"
    >
    </po-page-dynamic-table>
  `
})
export class Feriados {
  readonly fields: Array<PoPageDynamicTableField> = [
    { property: 'id', key: true, label: 'Id', filter: true, width: '70px' },
    { property: 'data_feriado', label: 'Data', type: 'date', filter: true },
    { property: 'descricao', label: 'Descrição', filter: true },
    { property: 'tipo', label: 'Tipo', options: [
      { value: 'N', label: 'Nacional' },
      { value: 'E', label: 'Estadual' },
      { value: 'M', label: 'Municipal' }
    ]}
  ];
}
