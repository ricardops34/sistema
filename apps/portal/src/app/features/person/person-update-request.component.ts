import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { PoButtonModule, PoFieldModule, PoPageModule, PoNotificationService } from '@po-ui/ng-components';

@Component({
  selector: 'portal-person-update-request',
  standalone: true,
  imports: [CommonModule, FormsModule, PoButtonModule, PoFieldModule, PoPageModule],
  template: `
    <po-page-default p-title="Solicitar Atualização Cadastral">
      <po-input label="Nome Legal" [(ngModel)]="payload.nameLegal" name="nameLegal"></po-input>
      <po-input label="Nome Social" [(ngModel)]="payload.nameSocial" name="nameSocial"></po-input>
      <po-textarea label="Observações" [(ngModel)]="payload.notes" name="notes"></po-textarea>
      <po-button label="Enviar Solicitação" (p-click)="submit()" [p-loading]="loading" p-type="primary"></po-button>
      <po-button label="Cancelar" (p-click)="cancel()"></po-button>
    </po-page-default>
  `,
})
export class PersonUpdateRequestComponent {
  @Input() personId = '';

  payload: { nameLegal: string; nameSocial: string; notes: string } = {
    nameLegal: '',
    nameSocial: '',
    notes: '',
  };
  loading = false;

  constructor(private http: HttpClient, private router: Router, private notification: PoNotificationService) {}

  submit() {
    this.loading = true;
    this.http.post('/api/people-requests', { personId: this.personId, payload: this.payload }).subscribe({
      next: () => { this.notification.success('Solicitação enviada'); this.router.navigate(['/person']); },
      error: () => { this.loading = false; this.notification.error('Erro ao enviar solicitação'); },
    });
  }

  cancel() {
    this.router.navigate(['/person']);
  }
}
