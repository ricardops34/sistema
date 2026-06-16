import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { PoButtonModule, PoFieldModule, PoPageModule, PoNotificationService } from '@po-ui/ng-components';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, PoButtonModule, PoFieldModule, PoPageModule],
  template: `
    <po-page-default p-title="Configurar Novo Tenant">
      <po-input label="Slug (identificador único)" [(ngModel)]="form.slug" name="slug"></po-input>
      <po-input label="Nome de exibição" [(ngModel)]="form.displayName" name="displayName"></po-input>
      <po-email label="E-mail do administrador" [(ngModel)]="form.adminEmail" name="adminEmail"></po-email>
      <po-password label="Senha do administrador" [(ngModel)]="form.adminPassword" name="adminPassword"></po-password>
      <po-button label="Criar Tenant" (p-click)="create()" [p-loading]="loading" p-type="primary"></po-button>
    </po-page-default>
  `,
})
export class OnboardingComponent {
  form = { slug: '', displayName: '', adminEmail: '', adminPassword: '' };
  loading = false;

  constructor(private http: HttpClient, private router: Router, private notification: PoNotificationService) {}

  create() {
    this.loading = true;
    this.http.post('/api/onboarding/tenants', this.form).subscribe({
      next: () => { this.notification.success('Tenant criado com sucesso'); this.router.navigate(['/login']); },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) this.notification.error('Slug já está em uso');
        else this.notification.error('Erro ao criar tenant');
      },
    });
  }
}
