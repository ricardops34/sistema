import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { PoTableModule, PoTableColumn, PoButtonModule, PoPageModule } from '@po-ui/ng-components';

interface Person {
  id: string;
  internalCode: string;
  nameLegal: string;
  tenantId: string;
}

@Component({
  selector: 'app-people-list',
  standalone: true,
  imports: [CommonModule, PoTableModule, PoButtonModule, PoPageModule],
  template: `
    <po-page-default
      p-title="Pessoas"
      [p-actions]="[{ label: 'Nova Pessoa', action: newPerson.bind(this) }]">
      <po-table [p-columns]="columns" [p-items]="items" [p-loading]="loading"></po-table>
    </po-page-default>
  `,
})
export class PeopleListComponent implements OnInit {
  items: Person[] = [];
  loading = false;

  columns: PoTableColumn[] = [
    { property: 'internalCode', label: 'Código' },
    { property: 'nameLegal', label: 'Nome Legal' },
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.http.get<{ items: Person[] }>('/api/people').subscribe({
      next: (res) => { this.items = res.items; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  newPerson() {
    this.router.navigate(['/people/new']);
  }
}
