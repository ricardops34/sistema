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
        path: 'empresas',
        loadComponent: () => import('./pages/cadastros/empresas/empresas').then((m) => m.Empresas),
      },
      {
        path: 'profissionais',
        loadComponent: () => import('./pages/cadastros/profissionais/profissionais').then((m) => m.Profissionais),
      },
      {
        path: 'funcoes',
        loadComponent: () => import('./pages/cadastros/funcoes/funcoes').then((m) => m.Funcoes),
      },
      {
        path: 'feriados',
        loadComponent: () => import('./pages/cadastros/feriados/feriados').then((m) => m.Feriados),
      },
      {
        path: 'colaboradores',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/cadastros/colaboradores/colaboradores').then((m) => m.Colaboradores),
          },
          {
            path: 'novo',
            loadComponent: () => import('./pages/cadastros/colaboradores/colaboradores-edit').then((m) => m.ColaboradoresEdit),
          },
          {
            path: 'editar/:id',
            loadComponent: () => import('./pages/cadastros/colaboradores/colaboradores-edit').then((m) => m.ColaboradoresEdit),
          }
        ]
      },
    ],
  },
  {
    path: 'servicos',
    canActivate: [authGuard],
    children: [
      {
        path: 'calendario',
        loadComponent: () => import('./pages/servicos/calendario/calendario').then((m) => m.Calendario),
      },
      {
        path: 'agendamentos',
        loadComponent: () => import('./pages/servicos/agendamentos/agendamentos').then((m) => m.Agendamentos),
      },
      {
        path: 'cadastros',
        children: [
          {
            path: 'contratos',
            loadComponent: () => import('./pages/servicos/cadastros/contratos/contratos').then((m) => m.Contratos),
          }
        ]
      },
      {
        path: 'manutencao',
        children: [
          {
            path: 'realizados',
            loadComponent: () => import('./pages/servicos/manutencao/realizados/realizados').then((m) => m.Realizados),
          },
          {
            path: 'relatorios',
            loadComponent: () => import('./pages/servicos/manutencao/relatorios/relatorios').then((m) => m.Relatorios),
          }
        ]
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: 'usuarios',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/usuarios/usuarios').then((m) => m.Usuarios),
          },
          {
            path: 'novo',
            loadComponent: () => import('./pages/admin/usuarios/usuarios-edit').then((m) => m.UsuariosEdit),
          },
          {
            path: 'editar/:id',
            loadComponent: () => import('./pages/admin/usuarios/usuarios-edit').then((m) => m.UsuariosEdit),
          }
        ]
      },
      {
        path: 'grupos',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/grupos/grupos').then((m) => m.Grupos),
          },
          {
            path: 'novo',
            loadComponent: () => import('./pages/admin/grupos/grupos-edit').then((m) => m.GruposEdit),
          },
          {
            path: 'editar/:id',
            loadComponent: () => import('./pages/admin/grupos/grupos-edit').then((m) => m.GruposEdit),
          }
        ]
      }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];
