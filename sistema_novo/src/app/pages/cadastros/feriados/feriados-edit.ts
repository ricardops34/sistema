import { Component } from '@angular/core';
import { PoPageDynamicEditModule, PoPageDynamicEditField } from '@po-ui/ng-templates';

@Component({
  selector: 'app-feriados-edit',
  standalone: true,
  imports: [PoPageDynamicEditModule],
  template: `
    <po-page-dynamic-edit
      p-title="Manutenção de Feriados"
      [p-fields]="fields"
      p-service-api="/api/v1/feriados"
    >
    </po-page-dynamic-edit>
  `
})
export class FeriadosEdit {
  readonly fields: Array<PoPageDynamicEditField> = [
    { property: 'id', key: true, label: 'Id', disabled: true },
    { property: 'data_feriado', label: 'Data', type: 'date', required: true },
    { property: 'descricao', label: 'Descrição', required: true },
    { property: 'tipo', label: 'Tipo', options: [
      { value: 'N', label: 'Nacional' },
      { value: 'E', label: 'Estadual' },
      { value: 'M', label: 'Municipal' }
    ], required: true }
  ];
}
