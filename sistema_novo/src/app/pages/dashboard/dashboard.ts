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
        <po-widget class="po-md-4 po-mb-1" p-title="Horas no Mês" p-primary="168">
          <div class="po-font-subtitle po-text-center">Meta: 160h</div>
        </po-widget>
        
        <po-widget class="po-md-4 po-mb-1" p-title="Faturamento Bruto" p-primary="R$ 42.500">
          <div class="po-font-subtitle po-text-center">Crescimento: +12%</div>
        </po-widget>

        <po-widget class="po-md-4 po-mb-1" p-title="Projetos Ativos" p-primary="12">
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

        <!-- Gráfico de Faturamento por Cliente -->
        <po-chart 
          class="po-md-4 po-mb-1"
          p-title="Faturamento por Cliente"
          [p-series]="billingSeries"
          [p-type]="donutChart"
        >
        </po-chart>
      </div>
    </po-page-default>
  `
})
export class Dashboard {
  readonly columnChart = PoChartType.Column;
  readonly donutChart = PoChartType.Donut;

  readonly hoursSeries: Array<PoChartSerie> = [
    { label: 'Horas Realizadas', data: [120, 150, 180, 200, 140, 160], color: 'color-01' }
  ];

  readonly categories: Array<string> = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];

  readonly billingSeries: Array<PoChartSerie> = [
    { label: 'RCG Consultoria', data: 45, color: 'color-01' },
    { label: 'Posto Central', data: 25, color: 'color-02' },
    { label: 'Mercado Bom Preço', data: 20, color: 'color-03' },
    { label: 'Outros', data: 10, color: 'color-04' }
  ];
}
