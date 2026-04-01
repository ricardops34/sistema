import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PoPageModule,
  PoWidgetModule,
  PoChartModule,
  PoChartSerie,
  PoChartType
} from '@po-ui/ng-components';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, PoPageModule, PoWidgetModule, PoChartModule],
  template: `
    <po-page-default p-title="Painel de Gestão (BI)">
      <div class="po-row">
        <!-- Widgets de KPI -->
        <po-widget class="po-md-4 po-mb-1" p-title="Horas no Mês (168)" [p-primary]="true">
          <div class="po-font-subtitle po-text-center">Meta: 160h</div>
        </po-widget>

        <po-widget class="po-md-4 po-mb-1" p-title="Faturamento Bruto (R$ 42.500)" [p-primary]="true">
          <div class="po-font-subtitle po-text-center">Crescimento: +12%</div>
        </po-widget>

        <po-widget class="po-md-4 po-mb-1" p-title="Projetos Ativos (12)" [p-primary]="true">
          <div class="po-font-subtitle po-text-center">3 em fase final</div>
        </po-widget>
      </div>

      <div class="po-row po-mt-2">
        <!-- Gráfico de Produtividade -->
        <po-chart
          class="po-md-8 po-mb-1"
          p-title="Produtividade por Mês (Horas)"
          [p-series]="hoursSeries"
          [p-categories]="categories"
          [p-type]="columnChart"
        >
        </po-chart>
      </div>
    </po-page-default>
  `
})
export class DashboardComponent {
  hoursSeries: Array<PoChartSerie> = [
    { label: 'Horas Apontadas', data: [120, 145, 130, 168], color: 'color-01' },
    { label: 'Meta', data: [160, 160, 160, 160], color: 'color-07' }
  ];

  categories: Array<string> = ['Jan', 'Fev', 'Mar', 'Abr'];
  columnChart: PoChartType = PoChartType.Column;
}
