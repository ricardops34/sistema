import { Component } from '@angular/core';
import { PoPageDynamicTableModule, PoPageDynamicTableField } from '@po-ui/ng-templates';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [PoPageDynamicTableModule],
  template: `
    <po-page-dynamic-table
      p-title="Gestão de Usuários"
      [p-fields]="fields"
      p-service-api="/api/v1/users"
    >
    </po-page-dynamic-table>
  `
})
export class Usuarios {
  readonly fields: Array<PoPageDynamicTableField> = [
    { property: 'id', key: true, label: 'ID', filter: true, width: '70px' },
    { property: 'login', label: 'Login', filter: true },
    { property: 'nome', label: 'Nome Completo', filter: true },
    { property: 'email', label: 'Email', filter: true },
    { property: 'perfil', label: 'Perfil', filter: true, options: [
      { value: 'admin', label: 'Administrador' },
      { value: 'user', label: 'Usuário Comum' },
      { value: 'guest', label: 'Convidado' }
    ]},
    { property: 'status', label: 'Status', type: 'label', filter: true, options: [
      { value: 'A', label: 'Ativo', color: 'color-11' },
      { value: 'I', label: 'Inativo', color: 'color-07' }
    ]}
  ];
}
