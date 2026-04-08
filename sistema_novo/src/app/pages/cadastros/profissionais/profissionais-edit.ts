import { Component } from '@angular/core';
import { PoPageDynamicEditModule, PoPageDynamicEditField, PoPageDynamicEditActions } from '@po-ui/ng-templates';

@Component({
  selector: 'app-profissionais-edit',
  standalone: true,
  imports: [PoPageDynamicEditModule],
  template: `
    <po-page-dynamic-edit
      p-title="Manutenção de Profissional"
      [p-fields]="fields"
      [p-actions]="actions"
      p-service-api="http://localhost:3000/v1/professionals"
    >
    </po-page-dynamic-edit>
  `
})
export class ProfissionaisEdit {
  readonly actions: PoPageDynamicEditActions = {
    save: '/cadastros/profissionais',
    cancel: '/cadastros/profissionais'
  };

  readonly fields: Array<PoPageDynamicEditField> = [
    { property: 'id', key: true, label: 'Id', disabled: true },
    { property: 'name', label: 'Nome Completo', required: true, divider: 'DADOS PESSOAIS' },
    { property: 'systemUser', label: 'Usuário do Sistema', required: true, divider: 'SISTEMA' },
    { property: 'status', label: 'Status', required: true, options: [
      { value: 'A', label: 'Ativo' },
      { value: 'I', label: 'Inativo' }
    ]}
  ];
}
