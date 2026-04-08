import { Component } from '@angular/core';
import { PoPageDynamicTableModule, PoPageDynamicTableField, PoPageDynamicTableActions } from '@po-ui/ng-templates';
import { PoBreadcrumb } from '@po-ui/ng-components';

@Component({
  selector: 'app-profissionais',
  standalone: true,
  imports: [PoPageDynamicTableModule],
  templateUrl: './profissionais.html',
})
export class Profissionais {
  readonly breadcrumb: PoBreadcrumb = {
    items: [{ label: 'Home', link: '/' }, { label: 'Cadastros' }, { label: 'Profissionais' }],
  };

  readonly actions: PoPageDynamicTableActions = {
    new: '/cadastros/profissionais/novo',
    detail: '/cadastros/profissionais/visualizar/:id',
    edit: '/cadastros/profissionais/editar/:id',
    remove: true
  };

  readonly fields: Array<PoPageDynamicTableField> = [
    { property: 'id', key: true, label: 'Id', filter: true, width: '10%' },
    { property: 'name', label: 'Nome', filter: true },
    { property: 'systemUser', label: 'Usuário do Sistema', filter: true },
  ];
}
