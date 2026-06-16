import { Routes } from '@angular/router';

export const PORTAL_ROUTES: Routes = [
  { path: '', redirectTo: '/person', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'person',
    loadComponent: () => import('./features/person/person-view.component').then((m) => m.PersonViewComponent),
  },
  {
    path: 'person/update-request',
    loadComponent: () => import('./features/person/person-update-request.component').then((m) => m.PersonUpdateRequestComponent),
  },
  { path: '**', redirectTo: '/person' },
];
