import { Component } from '@angular/core';
import { PoPageDynamicTableModule } from '@po-ui/ng-templates';
import { PoBreadcrumb, PoPageDynamicTableField } from '@po-ui/ng-components';

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

  readonly fields: Array<PoPageDynamicTableField> = [
    { property: 'id', key: true, label: 'Id', filter: true, width: '10%' },
    { property: 'nome', label: 'Nome', filter: true },
    { property: 'usuarioSistema', label: 'Usuário do Sistema', filter: true },
  ];
}
