import { Component } from '@angular/core';
import { PoPageDynamicTableModule, PoPageDynamicTableField, PoPageDynamicTableActions } from '@po-ui/ng-templates';

@Component({
  selector: 'app-empresas',
  imports: [PoPageDynamicTableModule],
  template: `
    <po-page-dynamic-table
      p-title="Listagem de Empresas"
      [p-fields]="fields"
      [p-actions]="actions"
      p-service-api="http://localhost:3000/v1/companies"
    >
    </po-page-dynamic-table>
  `
})
export class Empresas {
  readonly actions: PoPageDynamicTableActions = {
    new: '/cadastros/empresas/novo',
    detail: '/cadastros/empresas/visualizar/:id',
    edit: '/cadastros/empresas/editar/:id',
    remove: true
  };

  readonly fields: Array<PoPageDynamicTableField> = [
    { property: 'id', key: true, label: 'Id', filter: true, width: '70px' },
    { property: 'name', label: 'Nome', filter: true },
    { property: 'legalName', label: 'Razão Social' },
    { property: 'color', label: 'Cor', width: '80px' },
    { property: 'stateName', label: 'UF', width: '60px' },
    { property: 'cityName', label: 'Cidade' },
    { property: 'responsible', label: 'Responsável' }
  ];
}
