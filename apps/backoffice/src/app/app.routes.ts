import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  { path: '', redirectTo: '/people', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/onboarding/onboarding.component').then((m) => m.OnboardingComponent),
  },
  {
    path: 'people',
    loadComponent: () => import('./features/people/people-list.component').then((m) => m.PeopleListComponent),
  },
  {
    path: 'people/new',
    loadComponent: () => import('./features/people/people-form.component').then((m) => m.PeopleFormComponent),
  },
  { path: '**', redirectTo: '/people' },
];
