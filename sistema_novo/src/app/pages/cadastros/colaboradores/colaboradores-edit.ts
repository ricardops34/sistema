import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  PoPageModule, PoFieldModule, PoButtonModule,
  PoNotificationService, PoDividerModule, PoSwitchModule,
  PoLookupColumn
} from '@po-ui/ng-components';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-colaboradores-edit',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    PoPageModule, PoFieldModule, PoButtonModule,
    PoDividerModule, PoSwitchModule
  ],
  template: `
    <po-page-default [p-title]="isNew ? 'Novo Colaborador' : 'Editar Colaborador'">

      <po-divider p-label="Informações Básicas"></po-divider>
      <div class="po-row">
        <po-input class="po-md-12" [(ngModel)]="collaborator.name" p-label="Nome" p-required></po-input>
      </div>
      <div class="po-row">
        <po-email class="po-md-12" [(ngModel)]="collaborator.email" p-label="E-mail"></po-email>
      </div>
      <div class="po-row">
        <po-input class="po-md-4" [(ngModel)]="collaborator.phone" p-label="Telefone" p-mask="(99) 99999-9999"></po-input>
        <po-switch class="po-md-3" [(ngModel)]="collaborator.whatsapp" p-label="WhatsApp" p-label-on="Sim" p-label-off="Não"></po-switch>
        <po-lookup
          class="po-md-5"
          [(ngModel)]="collaborator.roleId"
          p-label="Função"
          p-field-label="name"
          p-field-value="id"
          p-service="http://localhost:3000/v1/roles"
          [p-columns]="roleLookupColumns"
        ></po-lookup>
      </div>

      <po-divider p-label="Status"></po-divider>
      <div class="po-row">
        <po-switch class="po-md-3" [(ngModel)]="isActive" p-label="Ativo" p-label-on="Sim" p-label-off="Não"></po-switch>
      </div>

      <div class="po-row po-mt-3">
        <po-button class="po-md-2" p-label="Salvar" [p-kind]="'primary'" p-icon="an an-floppy-disk" (p-click)="save()"></po-button>
        <po-button class="po-md-2" p-label="Cancelar" (p-click)="cancel()"></po-button>
      </div>

    </po-page-default>
  `
})
export class ColaboradoresEdit implements OnInit {
  collaborator: any = { name: '', email: '', phone: '', whatsapp: false, roleId: null };
  isNew = true;
  isActive = true;
  collaboratorId: number | null = null;

  roleLookupColumns: PoLookupColumn[] = [
    { property: 'name', label: 'Função' }
  ];

  private apiUrl = 'http://localhost:3000/v1/collaborators';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private poNotification: PoNotificationService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isNew = false;
      this.collaboratorId = parseInt(id);
      this.http.get<any>(`${this.apiUrl}/${this.collaboratorId}`).subscribe(data => {
        this.collaborator = data;
        this.isActive = data.status === 'A';
      });
    }
  }

  save() {
    const payload = { ...this.collaborator, status: this.isActive ? 'A' : 'I' };
    delete payload.role;
    delete payload.companies;

    const req = this.isNew
      ? this.http.post(this.apiUrl, payload)
      : this.http.put(`${this.apiUrl}/${this.collaboratorId}`, payload);

    req.subscribe({
      next: () => {
        this.poNotification.success('Colaborador salvo com sucesso!');
        this.router.navigate(['/cadastros/colaboradores']);
      },
      error: (err) => this.poNotification.error(err.error?.message || 'Erro ao salvar colaborador.')
    });
  }

  cancel() {
    this.router.navigate(['/cadastros/colaboradores']);
  }
}
