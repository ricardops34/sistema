import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PoButtonModule, PoFieldModule, PoNotificationService } from '@po-ui/ng-components';
import { PortalAuthService } from '../../core/auth/portal-auth.service';

@Component({
  selector: 'portal-login',
  standalone: true,
  imports: [CommonModule, FormsModule, PoButtonModule, PoFieldModule],
  template: `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;">
      <div style="width:360px;">
        <h2>Portal do Colaborador</h2>
        <po-input label="Tenant" [(ngModel)]="tenantSlug" name="tenantSlug"></po-input>
        <po-input label="E-mail" [(ngModel)]="login" name="login"></po-input>
        <po-password label="Senha" [(ngModel)]="password" name="password"></po-password>
        <po-button label="Entrar" (p-click)="doLogin()" [p-loading]="loading" p-type="primary"></po-button>
      </div>
    </div>
  `,
})
export class LoginComponent {
  tenantSlug = '';
  login = '';
  password = '';
  loading = false;

  constructor(private auth: PortalAuthService, private router: Router, private notification: PoNotificationService) {}

  doLogin() {
    this.loading = true;
    this.auth.login(this.login, this.password, this.tenantSlug).subscribe({
      next: () => this.router.navigate(['/person']),
      error: () => { this.loading = false; this.notification.error('Credenciais inválidas'); },
      complete: () => (this.loading = false),
    });
  }
}
