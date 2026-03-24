import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { PoMenuItem, PoMenuModule, PoPageModule, PoToolbarModule } from '@po-ui/ng-components';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, PoToolbarModule, PoMenuModule, PoPageModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  isLoginPage = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.isLoginPage = this.router.url.includes('/login');

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isLoginPage = event.url.includes('/login') || event.urlAfterRedirects.includes('/login');
    });
  }

  get filteredMenus(): Array<PoMenuItem> {
    const permissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
    if (permissions.includes('all')) {
      return this.menus;
    }
    return this.menus.filter(menu => permissions.includes(menu.label));
  }

  onLogout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userPermissions');
    this.router.navigate(['/login']);
  }

  readonly profileActions: Array<any> = [
    { label: 'Sair', action: () => this.onLogout(), icon: 'an an-sign-out' }
  ];

  readonly menus: Array<PoMenuItem> = [
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
      label: 'Gráficos',
      icon: 'an an-chart-bar',
      subItems: [
        { label: 'Horas por profissional', link: '/graficos/horas-profissional' },
        { label: 'Valor por profissional', link: '/graficos/valor-profissional' },
      ],
    },
    {
      label: 'Configurações',
      icon: 'an an-gear',
      subItems: [
        { label: 'Dashboard', link: '/admin/dashboard' },
        { label: 'Usuários', link: '/admin/usuarios' },
        { label: 'Grupos', link: '/admin/grupos' },
        { label: 'Preferências', link: '/admin/preferencias' },
      ],
    },
  ];
}
