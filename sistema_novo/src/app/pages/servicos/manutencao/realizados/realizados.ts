import { Component } from '@angular/core';
import { PoPageDynamicTableModule, PoPageDynamicTableField, PoPageDynamicTableCustomTableAction } from '@po-ui/ng-templates';
import { PoNotificationService } from '@po-ui/ng-components';

@Component({
  selector: 'app-realizados',
  standalone: true,
  imports: [PoPageDynamicTableModule],
  template: `
    <po-page-dynamic-table
      p-title="Trabalhos Realizados"
      [p-fields]="fields"
      p-service-api="/api/v1/realizados"
      [p-table-custom-actions]="tableCustomActions"
    >
    </po-page-dynamic-table>
  `
})
export class Realizados {
  public readonly tableCustomActions: Array<PoPageDynamicTableCustomTableAction> = [
    { label: 'Imprimir PDF', action: this.printPDF.bind(this), icon: 'po-icon-print' }
  ];

  readonly fields: Array<PoPageDynamicTableField> = [
    { property: 'id', key: true, label: 'ID', filter: true, width: '70px' },
    { property: 'data_realizado', label: 'Data', type: 'date', filter: true },
    { property: 'profissional_nome', label: 'Profissional', filter: true },
    { property: 'empresa_nome', label: 'Empresa', filter: true },
    { property: 'descricao', label: 'Descrição do Serviço' },
    { property: 'horas_total', label: 'Horas', type: 'number', filter: true },
    { property: 'valor_total', label: 'Valor (R$)', type: 'currency', format: 'BRL', filter: true },
    { property: 'status', label: 'Status', type: 'label', filter: true, options: [
      { value: 'C', label: 'Confirmado', color: 'color-11' },
      { value: 'P', label: 'Pendente', color: 'color-08' },
      { value: 'A', label: 'Cancelado', color: 'color-07' }
    ]}
  ];

  constructor(private poNotification: PoNotificationService) {}

  printPDF(item: any) {
    this.poNotification.information(`Iniciando impressão do serviço ID: ${item.id}`);
    window.open('/api/v1/relatorios/servicos?id=' + item.id, '_blank');
  }
}
