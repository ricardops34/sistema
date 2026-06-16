import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { PoButtonModule, PoFieldModule, PoPageModule, PoNotificationService } from '@po-ui/ng-components';

@Component({
  selector: 'app-people-form',
  standalone: true,
  imports: [CommonModule, FormsModule, PoButtonModule, PoFieldModule, PoPageModule],
  template: `
    <po-page-default
      p-title="Nova Pessoa"
      [p-breadcrumb]="{ items: [{ label: 'Pessoas', link: '/people' }, { label: 'Nova' }] }">
      <po-input label="Nome Legal *" [(ngModel)]="form.nameLegal" name="nameLegal"></po-input>
      <po-input label="Nome Social" [(ngModel)]="form.nameSocial" name="nameSocial"></po-input>
      <po-button label="Salvar" (p-click)="save()" [p-loading]="loading" p-type="primary"></po-button>
      <po-button label="Cancelar" (p-click)="cancel()"></po-button>
    </po-page-default>
  `,
})
export class PeopleFormComponent {
  form = { nameLegal: '', nameSocial: '' };
  loading = false;

  constructor(private http: HttpClient, private router: Router, private notification: PoNotificationService) {}

  save() {
    if (!this.form.nameLegal.trim()) {
      this.notification.warning('Nome Legal é obrigatório');
      return;
    }
    this.loading = true;
    this.http.post('/api/people', this.form).subscribe({
      next: () => { this.notification.success('Pessoa criada com sucesso'); this.router.navigate(['/people']); },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) this.notification.warning('Duplicidade detectada');
        else this.notification.error('Erro ao salvar');
      },
    });
  }

  cancel() {
    this.router.navigate(['/people']);
  }
}
