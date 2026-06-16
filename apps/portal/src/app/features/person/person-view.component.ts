import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PoPageModule, PoInfoModule, PoButtonModule } from '@po-ui/ng-components';
import { Router } from '@angular/router';

interface Person {
  id: string;
  internalCode: string;
  nameLegal: string;
  nameSocial: string;
  birthDate: string;
}

@Component({
  selector: 'portal-person-view',
  standalone: true,
  imports: [CommonModule, PoPageModule, PoInfoModule, PoButtonModule],
  template: `
    <po-page-default
      p-title="Meus Dados"
      [p-actions]="[{ label: 'Solicitar Atualização', link: '/person/update-request' }]">
      <div *ngIf="person">
        <po-info label="Código" [p-value]="person.internalCode"></po-info>
        <po-info label="Nome Legal" [p-value]="person.nameLegal"></po-info>
        <po-info label="Nome Social" [p-value]="person.nameSocial || '-'"></po-info>
        <po-info label="Data Nascimento" [p-value]="person.birthDate || '-'"></po-info>
      </div>
      <div *ngIf="!person && !loading">
        <p>Nenhum registro encontrado.</p>
      </div>
    </po-page-default>
  `,
})
export class PersonViewComponent implements OnInit {
  person: Person | null = null;
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<{ items: Person[] }>('/api/people').subscribe({
      next: (res) => { this.person = res.items[0] ?? null; this.loading = false; },
      error: () => (this.loading = false),
    });
  }
}
