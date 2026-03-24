import { Component } from '@angular/core';
import { PoPageDynamicTableModule } from '@po-ui/ng-templates';
import { PoBreadcrumb, PoPageDynamicTableField } from '@po-ui/ng-components';

@Component({
  selector: 'app-funcoes',
  standalone: true,
  imports: [PoPageDynamicTableModule],
  templateUrl: './funcoes.html',
})
export class Funcoes {
  readonly breadcrumb: PoBreadcrumb = {
    items: [{ label: 'Home', link: '/' }, { label: 'Cadastros' }, { label: 'Funções' }],
  };

  readonly fields: Array<PoPageDynamicTableField> = [
    { property: 'id', key: true, label: 'Id', filter: true, width: '10%' },
    { property: 'descricao', label: 'Descrição', filter: true },
  ];
}
