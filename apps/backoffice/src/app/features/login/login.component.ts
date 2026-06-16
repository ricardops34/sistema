import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PoButtonModule, PoFieldModule, PoNotificationService } from '@po-ui/ng-components';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, PoButtonModule, PoFieldModule],
  template: `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;">
      <div style="width:360px;">
        <h2>Backoffice</h2>
        <po-input label="E-mail / Login" [(ngModel)]="login" name="login"></po-input>
        <po-password label="Senha" [(ngModel)]="password" name="password"></po-password>
        <po-button label="Entrar" (p-click)="doLogin()" [p-loading]="loading" p-type="primary"></po-button>
      </div>
    </div>
  `,
})
export class LoginComponent {
  login = '';
  password = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router, private notification: PoNotificationService) {}

  doLogin() {
    this.loading = true;
    this.authService.login(this.login, this.password).subscribe({
      next: () => this.router.navigate(['/people']),
      error: () => {
        this.loading = false;
        this.notification.error('Credenciais inválidas');
      },
      complete: () => (this.loading = false),
    });
  }
}
