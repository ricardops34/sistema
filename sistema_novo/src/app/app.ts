import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { PoMenuItem, PoMenuModule, PoPageModule, PoToolbarModule } from '@po-ui/ng-components';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, PoToolbarModule, PoMenuModule, PoPageModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  isLoginPage = false;
  isLoggedIn = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.authService.isAuthenticated.subscribe(state => {
      this.isLoggedIn = state;
    });

    this.checkRoute(this.router.url);
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute(event.url || event.urlAfterRedirects);
    });
  }

  private checkRoute(url: string) {
    this.isLoginPage = url.includes('/login');
  }

  get filteredMenus(): Array<PoMenuItem> {
    if (!this.isLoggedIn) return [];
    
    const permissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
    if (permissions.includes('all')) {
      return this.menus;
    }
    return this.menus.filter(menu => permissions.includes(menu.label));
  }

  onLogout() {
    this.authService.logout();
  }

  readonly profile = {
    title: 'Administrador',
    subtitle: 'ricardo.admin',
    avatar: 'https://avatar.iran.liara.run/public/33' // Avatar genérico
  };

  readonly profileActions: Array<any> = [
    { label: 'Sair', action: () => this.onLogout(), icon: 'an an-sign-out' }
  ];

  readonly menus: Array<PoMenuItem> = [
    { label: 'Dashboard', icon: 'an an-chart-line', link: '/cadastros/profissionais' },
    {
      label: 'Cadastros básicos',
      icon: 'an an-archive',
      subItems: [
        { label: 'Profissionais', link: '/cadastros/profissionais' },
        { label: 'Empresas', link: '/cadastros/empresas' },
        { label: 'Estados', link: '/cadastros/estados' },
        { label: 'Cidades', link: '/cadastros/cidades' },
        { label: 'Feriados', link: '/cadastros/feriados' },
        { label: 'Colaboradores', link: '/cadastros/colaboradores' },
        { label: 'Funções', link: '/cadastros/funcoes' },
      ],
    },
    {
      label: 'Serviços',
      icon: 'an an-wrench',
      subItems: [
        { label: 'Calendário', link: '/servicos/calendario' },
        { label: 'Agendamentos', link: '/servicos/agendamentos' },
        {
          label: 'Manutenção',
          subItems: [
            { label: 'Trabalhos realizados', link: '/servicos/manutencao/realizados' },
            { label: 'Gerar Apontamentos', link: '/servicos/manutencao/gerar-apontamentos' },
            { label: 'Confirmar Apontamentos', link: '/servicos/manutencao/confirmar-apontamentos' },
          ],
        },
        {
          label: 'Cadastros',
          subItems: [{ label: 'Contratos', link: '/servicos/cadastros/contratos' }],
        },
      ],
    },
    {
      label: 'Configurações',
      icon: 'an an-gear',
      subItems: [
        { label: 'Usuários', link: '/admin/usuarios' },
        { label: 'Grupos', link: '/admin/grupos' },
        { label: 'Preferências', link: '/admin/preferencias' },
      ],
    }
  ];
}
