import { Component } from '@angular/core';
import { PoPageDynamicTableModule, PoPageDynamicTableField } from '@po-ui/ng-templates';
import { PoBreadcrumb } from '@po-ui/ng-components';

@Component({
  selector: 'app-estados',
  standalone: true,
  imports: [PoPageDynamicTableModule],
  templateUrl: './estados.html',
})
export class Estados {
  readonly breadcrumb: PoBreadcrumb = {
    items: [{ label: 'Home', link: '/' }, { label: 'Cadastros' }, { label: 'Estados' }],
  };

  readonly fields: Array<PoPageDynamicTableField> = [
    { property: 'id', key: true, label: 'Id', filter: true, width: '10%' },
    { property: 'nome', label: 'Nome', filter: true },
  ];
}
