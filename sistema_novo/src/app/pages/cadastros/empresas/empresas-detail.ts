import { Component } from '@angular/core';
import { PoPageDynamicDetailModule, PoPageDynamicDetailField, PoPageDynamicDetailActions } from '@po-ui/ng-templates';

@Component({
  selector: 'app-empresas-detail',
  standalone: true,
  imports: [PoPageDynamicDetailModule],
  template: `
    <po-page-dynamic-detail
      p-title="Detalhes da Empresa"
      [p-fields]="fields"
      [p-actions]="actions"
      p-service-api="http://localhost:3000/v1/companies"
    >
    </po-page-dynamic-detail>
  `
})
export class EmpresasDetail {
  readonly actions: PoPageDynamicDetailActions = {
    back: '/cadastros/empresas',
    edit: '/cadastros/empresas/editar/:id',
    remove: '/cadastros/empresas'
  };

  readonly fields: Array<PoPageDynamicDetailField> = [
    { property: 'id', key: true, label: 'Id' },
    { property: 'name', label: 'Nome', divider: 'DADOS PRINCIPAIS' },
    { property: 'legalName', label: 'Razão Social' },
    { property: 'color', label: 'Cor' },
    { property: 'address', label: 'Endereço', divider: 'LOCALIZAÇÃO' },
    { property: 'state', label: 'Estado' },
    { property: 'city', label: 'Cidade' },
    { property: 'responsible', label: 'Responsável', divider: 'CONTATO' },
    { property: 'status', label: 'Status', tag: true }
  ];
}
