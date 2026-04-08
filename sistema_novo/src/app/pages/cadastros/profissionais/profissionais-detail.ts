import { Component } from '@angular/core';
import { PoPageDynamicDetailModule, PoPageDynamicDetailField, PoPageDynamicDetailActions } from '@po-ui/ng-templates';

@Component({
  selector: 'app-profissionais-detail',
  standalone: true,
  imports: [PoPageDynamicDetailModule],
  template: `
    <po-page-dynamic-detail
      p-title="Detalhes do Profissional"
      [p-fields]="fields"
      [p-actions]="actions"
      p-service-api="http://localhost:3000/v1/professionals"
    >
    </po-page-dynamic-detail>
  `
})
export class ProfissionaisDetail {
  readonly actions: PoPageDynamicDetailActions = {
    back: '/cadastros/profissionais',
    edit: '/cadastros/profissionais/editar/:id',
    remove: '/cadastros/profissionais'
  };

  readonly fields: Array<PoPageDynamicDetailField> = [
    { property: 'id', key: true, label: 'Id' },
    { property: 'name', label: 'Nome Completo', divider: 'DADOS PESSOAIS' },
    { property: 'systemUser', label: 'Usuário do Sistema', divider: 'SISTEMA' },
    { property: 'status', label: 'Status', tag: true }
  ];
}
