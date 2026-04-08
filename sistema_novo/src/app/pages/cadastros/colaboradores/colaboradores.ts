import { Component } from '@angular/core';
import { PoPageDynamicTableModule, PoPageDynamicTableField, PoPageDynamicTableActions } from '@po-ui/ng-templates';

@Component({
  selector: 'app-colaboradores',
  standalone: true,
  imports: [PoPageDynamicTableModule],
  template: `
    <po-page-dynamic-table
      p-title="Listagem de Colaboradores"
      [p-fields]="fields"
      [p-actions]="actions"
      p-service-api="http://localhost:3000/v1/collaborators"
    >
    </po-page-dynamic-table>
  `
})
export class Colaboradores {
  readonly actions: PoPageDynamicTableActions = {
    new: '/cadastros/colaboradores/novo',
    detail: '/cadastros/colaboradores/visualizar/:id',
    edit: '/cadastros/colaboradores/editar/:id',
    remove: true
  };

  readonly fields: Array<PoPageDynamicTableField> = [
    { property: 'id', key: true, label: 'ID', filter: true, width: '70px' },
    { property: 'name', label: 'Nome', filter: true },
    { property: 'email', label: 'E-mail', filter: true },
    { property: 'phone', label: 'Telefone' },
    { property: 'roleName', label: 'Função' },
    { property: 'status', label: 'Status', type: 'label', filter: true, options: [
      { value: 'A', label: 'Ativo', color: 'color-11' },
      { value: 'I', label: 'Inativo', color: 'color-07' }
    ]}
  ];
}
