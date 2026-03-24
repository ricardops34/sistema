import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'cadastros',
    children: [
      {
        path: 'estados',
        loadComponent: () => import('./pages/cadastros/estados/estados').then((m) => m.Estados),
      },
      {
        path: 'cidades',
        loadComponent: () => import('./pages/cadastros/cidades/cidades').then((m) => m.Cidades),
      },
      {
        path: 'profissionais',
        loadComponent: () => import('./pages/cadastros/profissionais/profissionais').then((m) => m.Profissionais),
      },
      {
        path: 'funcoes',
        loadComponent: () => import('./pages/cadastros/funcoes/funcoes').then((m) => m.Funcoes),
      },
    ],
  },
  { path: '', redirectTo: 'cadastros/profissionais', pathMatch: 'full' },
];
