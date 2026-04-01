import { Component } from '@angular/core';
import { PoPageDynamicEditModule, PoPageDynamicEditField } from '@po-ui/ng-templates';

@Component({
  selector: 'app-colaboradores-edit',
  standalone: true,
  imports: [PoPageDynamicEditModule],
  template: `
    <po-page-dynamic-edit
      p-title="Manutenção de Colaborador"
      [p-fields]="fields"
      p-service-api="/api/v1/colaboradores"
    >
    </po-page-dynamic-edit>
  `
})
export class ColaboradoresEdit {
  readonly fields: Array<PoPageDynamicEditField> = [
    { property: 'id', key: true, label: 'ID', disabled: true },
    { property: 'nome', label: 'Nome Completo', required: true, divider: 'INFORMAÇÕES BÁSICAS' },
    { property: 'email', label: 'E-mail', required: true },
    { property: 'telefone', label: 'Telefone' },
    { property: 'matricula', label: 'Matrícula', required: true, divider: 'DADOS EMPRESARIAIS' },
    { property: 'funcao_id', label: 'Função', required: true },
    { property: 'status', label: 'Status', required: true, options: [
      { value: 'A', label: 'Ativo' },
      { value: 'I', label: 'Inativo' }
    ]}
  ];
}
