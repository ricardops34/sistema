import { Component } from '@angular/core';
import { PoPageDynamicEditModule, PoPageDynamicEditField } from '@po-ui/ng-templates';

@Component({
  selector: 'app-grupos-edit',
  standalone: true,
  imports: [PoPageDynamicEditModule],
  template: `
    <po-page-dynamic-edit
      p-title="Manutenção de Grupo de Acesso"
      [p-fields]="fields"
      p-service-api="/api/v1/groups"
    >
    </po-page-dynamic-edit>
  `
})
export class GruposEdit {
  readonly fields: Array<PoPageDynamicEditField> = [
    { property: 'id', key: true, label: 'ID', disabled: true },
    { property: 'nome', label: 'Nome do Grupo', required: true, divider: 'DADOS DO GRUPO' },
    { property: 'descricao', label: 'Descrição Detalhada', divider: 'INFORMAÇÕES ADICIONAIS' },
    { property: 'status', label: 'Status', required: true, options: [
      { value: 'A', label: 'Ativo' },
      { value: 'I', label: 'Inativo' }
    ]}
  ];
}
