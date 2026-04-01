import { Component } from '@angular/core';
import { PoPageDynamicEditModule, PoPageDynamicEditField } from '@po-ui/ng-templates';

@Component({
  selector: 'app-usuarios-edit',
  standalone: true,
  imports: [PoPageDynamicEditModule],
  template: `
    <po-page-dynamic-edit
      p-title="Manutenção de Usuário"
      [p-fields]="fields"
      p-service-api="/api/v1/users"
    >
    </po-page-dynamic-edit>
  `
})
export class UsuariosEdit {
  readonly fields: Array<PoPageDynamicEditField> = [
    { property: 'id', key: true, label: 'ID', disabled: true },
    { property: 'login', label: 'Login', required: true, divider: 'DADOS DE ACESSO' },
    { property: 'password', label: 'Senha', type: 'password', secret: true, required: true },
    { property: 'nome', label: 'Nome Completo', required: true, divider: 'INFORMAÇÕES PESSOAIS' },
    { property: 'email', label: 'E-mail', required: true },
    { property: 'perfil', label: 'Perfil de Acesso', required: true, options: [
      { value: 'admin', label: 'Administrador' },
      { value: 'user', label: 'Usuário Comum' },
      { value: 'guest', label: 'Convidado' }
    ]},
    { property: 'status', label: 'Status', required: true, options: [
      { value: 'A', label: 'Ativo' },
      { value: 'I', label: 'Inativo' }
    ]}
  ];
}
