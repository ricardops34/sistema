import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PoMenuModule, PoMenuItem, PoToolbarModule } from '@po-ui/ng-components';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PoMenuModule, PoToolbarModule],
  template: `
    <po-toolbar p-title="Backoffice"></po-toolbar>
    <po-menu [p-menus]="menuItems"></po-menu>
    <div class="po-wrapper">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent {
  menuItems: PoMenuItem[] = [
    { label: 'Pessoas', link: '/people', icon: 'po-icon-user' },
    { label: 'Novo Tenant', link: '/onboarding', icon: 'po-icon-settings' },
    { label: 'Sair', action: () => this.auth.logout(), icon: 'po-icon-exit' },
  ];

  constructor(private auth: AuthService) {}
}
