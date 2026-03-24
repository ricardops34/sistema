import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'cadastros',
    canActivate: [authGuard],
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
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  { path: '', redirectTo: 'cadastros/profissionais', pathMatch: 'full' },
];
