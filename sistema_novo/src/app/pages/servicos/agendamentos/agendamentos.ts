import { Component } from '@angular/core';
import { PoPageDynamicTableModule } from '@po-ui/ng-templates';

@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [PoPageDynamicTableModule],
  template: `
    <po-page-dynamic-table
      p-title="Listagem de Agendamentos"
      [p-fields]="fields"
      p-service-api="/api/v1/agendamentos"
    >
    </po-page-dynamic-table>
  `
})
export class Agendamentos {
  readonly fields = [
    { property: 'id', key: true, label: 'Id', filter: true, width: '70px' },
    { property: 'data_agenda', label: 'Data', type: 'date', filter: true },
    { property: 'tipo', label: 'Tipo', type: 'tag', labels: [
      { value: 'P', label: 'Presencial', color: 'color-10' },
      { value: 'R', label: 'Remoto', color: 'color-08' },
      { value: 'F', label: 'Falta', color: 'color-07' },
      { value: 'A', label: 'Agendada', color: 'color-11' }
    ]},
    { property: 'descricao', label: 'Descrição', filter: true },
    { property: 'contrato_nome', label: 'Contrato', filter: true },
    { property: 'profissional_nome', label: 'Profissional', filter: true },
    { property: 'hora_total', label: 'Total Horas', width: '100px' }
  ];
}
