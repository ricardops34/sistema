import { Component } from '@angular/core';
import { PoPageDynamicTableModule } from '@po-ui/ng-templates';
import { PoBreadcrumb, PoPageDynamicTableField } from '@po-ui/ng-components';

@Component({
  selector: 'app-cidades',
  standalone: true,
  imports: [PoPageDynamicTableModule],
  templateUrl: './cidades.html',
})
export class Cidades {
  readonly breadcrumb: PoBreadcrumb = {
    items: [{ label: 'Home', link: '/' }, { label: 'Cadastros' }, { label: 'Cidades' }],
  };

  readonly fields: Array<PoPageDynamicTableField> = [
    { property: 'id', key: true, label: 'Id', filter: true, width: '10%' },
    { property: 'estadoNome', label: 'Estado', filter: true },
    { property: 'nome', label: 'Nome', filter: true },
  ];
}
