import { Component } from '@angular/core';
import { PoPageDynamicTableModule } from '@po-ui/ng-templates';

@Component({
  selector: 'app-contratos',
  imports: [PoPageDynamicTableModule],
  template: `
    <po-page-dynamic-table
      p-title="Listagem de Contratos"
      [p-fields]="fields"
      p-service-api="/api/v1/contratos"
    >
    </po-page-dynamic-table>
  `
})
export class Contratos {
  readonly fields = [
    { property: 'id', key: true, label: 'Id', filter: true, width: '70px' },
    { property: 'empresaNome', label: 'Empresa', filter: true },
    { property: 'descricao', label: 'Descrição' },
    { property: 'dt_inicio', label: 'Data de início', type: 'date', filter: true },
    { property: 'dt_fim', label: 'Data de fim', type: 'date', filter: true },
    { property: 'tipo', label: 'Tipo', options: [
      { value: 'F', label: 'Fixo' },
      { value: 'H', label: 'Hora' }
    ]}
  ];
}
