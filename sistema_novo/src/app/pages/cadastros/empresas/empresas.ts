import { Component } from '@angular/core';
import { PoPageDynamicTableModule } from '@po-ui/ng-templates';

@Component({
  selector: 'app-empresas',
  imports: [PoPageDynamicTableModule],
  template: `
    <po-page-dynamic-table
      p-title="Listagem de Empresas"
      [p-fields]="fields"
      p-service-api="/api/v1/empresas"
    >
    </po-page-dynamic-table>
  `
})
export class Empresas {
  readonly fields = [
    { property: 'id', key: true, label: 'Id', filter: true, width: '70px' },
    { property: 'nome', label: 'Nome', filter: true },
    { property: 'razao', label: 'Razão Social' },
    { property: 'responsalvel', label: 'Responsável' },
    { property: 'cidadeNome', label: 'Cidade' },
    { property: 'endereco', label: 'Endereço' }
  ];
}
