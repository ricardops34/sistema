import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PoMenuItem, PoMenuModule, PoPageModule, PoToolbarModule } from '@po-ui/ng-components';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, PoToolbarModule, PoMenuModule, PoPageModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
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
