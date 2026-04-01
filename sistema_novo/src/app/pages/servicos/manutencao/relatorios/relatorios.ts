import { Component } from '@angular/core';
import { PoPageDynamicSearchModule, PoPageDynamicTableField } from '@po-ui/ng-templates';
import { PoBreadcrumb, PoNotificationService } from '@po-ui/ng-components';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [PoPageDynamicSearchModule],
  template: `
    <po-page-dynamic-search
      p-title="Central de Relatórios"
      [p-breadcrumb]="breadcrumb"
      [p-fields]="fields"
      (p-quick-search)="onQuickSearch($event)"
      (p-advanced-search)="onAdvancedSearch($event)"
    >
      <div class="po-row">
        <div class="po-md-12 po-mt-2">
            <p class="po-font-text">Selecione os filtros acima e clique em "Pesquisa Avançada" para gerar o documento PDF customizado.</p>
        </div>
      </div>
    </po-page-dynamic-search>
  `
})
export class Relatorios {
  public readonly breadcrumb: PoBreadcrumb = {
    items: [{ label: 'Home', link: '/' }, { label: 'Serviços', link: '/servicos' }, { label: 'Relatórios' }]
  };

  public readonly fields: Array<PoPageDynamicTableField> = [
    { property: 'data_inicio', label: 'Data Início', type: 'date', gridColumns: 6 },
    { property: 'data_fim', label: 'Data Fim', type: 'date', gridColumns: 6 },
    { property: 'empresa', label: 'Empresa', gridColumns: 12 },
    { property: 'formato', label: 'Formato de Saída', options: [
        { value: 'pdf', label: 'PDF (Documento)' },
        { value: 'xls', label: 'Excel (Planilha)' }
    ], gridColumns: 12 }
  ];

  constructor(private poNotification: PoNotificationService) {}

  onQuickSearch(event: any) {
    this.poNotification.success(`Relatório rápido gerado para: ${event}`);
    this.generateMockPDF();
  }

  onAdvancedSearch(event: any) {
    this.poNotification.success(`Relatório avançado solicitado para o período: ${event.data_inicio} até ${event.data_fim}`);
    this.generateMockPDF();
  }

  private generateMockPDF() {
    this.poNotification.information('Iniciando geração do PDF simulado...');
    // Lógica de download simulada (realizada no interceptor)
    window.open('/api/v1/relatorios/servicos?download=true', '_blank');
  }
}
