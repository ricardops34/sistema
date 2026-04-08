import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  PoPageModule, PoFieldModule, PoButtonModule,
  PoTableModule, PoTableColumn, PoModalModule, PoModalComponent,
  PoNotificationService, PoDividerModule, PoWidgetModule, PoSwitchModule,
  PoLookupColumn
} from '@po-ui/ng-components';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-empresas-edit',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    PoPageModule, PoFieldModule, PoButtonModule,
    PoTableModule, PoModalModule, PoDividerModule,
    PoWidgetModule, PoSwitchModule
  ],
  template: `
    <po-page-default [p-title]="isNew ? 'Nova Empresa' : 'Editar Empresa'">

      <po-divider p-label="Dados Principais"></po-divider>
      <div class="po-row">
        <po-input class="po-md-4" [(ngModel)]="company.name" p-label="Nome" p-required></po-input>
        <po-input class="po-md-5" [(ngModel)]="company.legalName" p-label="Razão Social"></po-input>
        <po-input class="po-md-3" [(ngModel)]="company.color" p-label="Cor"></po-input>
      </div>

      <po-divider p-label="Localização"></po-divider>
      <div class="po-row">
        <po-input class="po-md-6" [(ngModel)]="company.address" p-label="Endereço"></po-input>
        <po-lookup
          class="po-md-3"
          [(ngModel)]="company.stateId"
          p-label="Estado"
          p-field-label="uf"
          p-field-value="id"
          p-service="http://localhost:3000/v1/states"
          [p-columns]="stateLookupColumns"
        ></po-lookup>
        <po-lookup
          class="po-md-3"
          [(ngModel)]="company.cityId"
          p-label="Cidade"
          p-field-label="name"
          p-field-value="id"
          p-service="http://localhost:3000/v1/cities"
          [p-columns]="cityLookupColumns"
        ></po-lookup>
      </div>

      <po-divider p-label="Contato e Status"></po-divider>
      <div class="po-row">
        <po-input class="po-md-6" [(ngModel)]="company.responsible" p-label="Responsável"></po-input>
        <po-switch class="po-md-3" [(ngModel)]="isActive" p-label="Ativo" p-label-on="Sim" p-label-off="Não"></po-switch>
      </div>

      <div *ngIf="!isNew">
        <po-divider p-label="Colaboradores Vinculados"></po-divider>
        <div class="po-row po-mb-2">
          <po-lookup
            class="po-md-8"
            [(ngModel)]="selectedCollaboratorId"
            p-label="Adicionar Colaborador"
            p-field-label="name"
            p-field-value="id"
            p-service="http://localhost:3000/v1/collaborators"
            [p-columns]="collaboratorLookupColumns"
          ></po-lookup>
          <div class="po-md-4" style="display:flex; align-items:flex-end; padding-bottom:4px;">
            <po-button p-label="+ Adicionar" [p-kind]="'primary'" (p-click)="addCollaborator()"></po-button>
          </div>
        </div>
        <po-table [p-columns]="collaboratorColumns" [p-items]="collaborators" [p-actions]="collaboratorTableActions"></po-table>
      </div>

      <div class="po-row po-mt-3">
        <po-button class="po-md-2" p-label="Salvar" [p-kind]="'primary'" p-icon="an an-floppy-disk" (p-click)="save()"></po-button>
        <po-button class="po-md-2" p-label="Cancelar" (p-click)="cancel()"></po-button>
      </div>

    </po-page-default>
  `
})
export class EmpresasEdit implements OnInit {
  company: any = { name: '', legalName: '', color: '', address: '', stateId: null, cityId: null, responsible: '' };
  isNew = true;
  isActive = true;
  companyId: number | null = null;
  selectedCollaboratorId: number | null = null;
  collaborators: any[] = [];

  stateLookupColumns: PoLookupColumn[] = [
    { property: 'uf', label: 'UF' },
    { property: 'name', label: 'Nome' }
  ];

  cityLookupColumns: PoLookupColumn[] = [
    { property: 'name', label: 'Cidade' }
  ];

  collaboratorLookupColumns: PoLookupColumn[] = [
    { property: 'name', label: 'Nome' },
    { property: 'roleName', label: 'Função' },
    { property: 'phone', label: 'Telefone' }
  ];

  collaboratorColumns: PoTableColumn[] = [
    { property: 'name', label: 'Colaborador' },
    { property: 'roleName', label: 'Função' },
    { property: 'phone', label: 'Telefone' },
  ];

  collaboratorTableActions = [
    { action: this.removeCollaborator.bind(this), icon: 'an an-trash', label: 'Remover', type: 'danger' }
  ];

  private apiUrl = 'http://localhost:3000/v1/companies';

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
      this.companyId = parseInt(id);
      this.loadCompany();
      this.loadCollaborators();
    }
  }

  loadCompany() {
    this.http.get<any>(`${this.apiUrl}/${this.companyId}`).subscribe(data => {
      this.company = data;
      this.isActive = data.status === 'A';
    });
  }

  loadCollaborators() {
    this.http.get<any[]>(`${this.apiUrl}/${this.companyId}/collaborators`).subscribe(data => {
      this.collaborators = data;
    });
  }

  addCollaborator() {
    if (!this.selectedCollaboratorId) {
      this.poNotification.warning('Selecione um colaborador.');
      return;
    }
    this.http.post(`${this.apiUrl}/${this.companyId}/collaborators`, { collaboratorId: this.selectedCollaboratorId }).subscribe({
      next: () => {
        this.poNotification.success('Colaborador vinculado com sucesso!');
        this.selectedCollaboratorId = null;
        this.loadCollaborators();
      },
      error: () => this.poNotification.error('Erro ao vincular colaborador. Pode já estar vinculado.')
    });
  }

  removeCollaborator(row: any) {
    if (confirm(`Deseja remover ${row.name} desta empresa?`)) {
      this.http.delete(`${this.apiUrl}/${this.companyId}/collaborators/${row.id}`).subscribe({
        next: () => {
          this.poNotification.success('Colaborador removido!');
          this.loadCollaborators();
        },
        error: () => this.poNotification.error('Erro ao remover colaborador.')
      });
    }
  }

  save() {
    const payload = { ...this.company, status: this.isActive ? 'A' : 'I' };
    // Remove campos de relação que não devem ir no body
    delete payload.collaborators;
    delete payload.state;
    delete payload.city;
    delete payload.appointments;

    const req = this.isNew
      ? this.http.post(this.apiUrl, payload)
      : this.http.put(`${this.apiUrl}/${this.companyId}`, payload);

    req.subscribe({
      next: () => {
        this.poNotification.success('Empresa salva com sucesso!');
        this.router.navigate(['/cadastros/empresas']);
      },
      error: (err) => this.poNotification.error(err.error?.message || 'Erro ao salvar empresa.')
    });
  }

  cancel() {
    this.router.navigate(['/cadastros/empresas']);
  }
}
