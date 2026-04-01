import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoPageDynamicSearchModule } from '@po-ui/ng-templates';
import { PoBreadcrumb, PoNotificationService, PoModule } from '@po-ui/ng-components';

@Component({
    selector: 'app-relatorios',
    standalone: true,
    imports: [CommonModule, PoPageDynamicSearchModule, PoModule],
    template: `
        <po-page-dynamic-search
              p-title="Central de Relatorios"
                    [p-breadcrumb]="breadcrumb"
                          [p-fields]="fields"
                                (p-quick-search)="onQuickSearch($event)"
                                      (p-advanced-search)="onAdvancedSearch($event)"
                                          >
                                                <div class="po-row">
                                                        <div class="po-md-12 po-mt-2">
                                                                  <p class="po-font-text">Selecione filtros e clique em "Pesquisa Avancada".</p>
                                                                          </div>
                                                                                </div>
                                                                                    </po-page-dynamic-search>
                                                                                      `
})
  export class Relatorios {
    public readonly breadcrumb: PoBreadcrumb = {
          items: [
            { label: 'Home', link: '/' },
            { label: 'Servicos', link: '/servicos' },
            { label: 'Relatorios' }
                ]
    };

  public readonly fields: Array<any> = [
    { property: 'data_inicio', label: 'Data Inicio', type: 'date', gridColumns: 6 },
    { property: 'data_fim', label: 'Data Fim', type: 'date', gridColumns: 6 },
    { property: 'empresa', label: 'Empresa', gridColumns: 12 }
      ];

  constructor(private poNotification: PoNotificationService) {}

  onQuickSearch(filter: string) {
        this.poNotification.information(`Pesquisa: ${filter}`);
  }

  onAdvancedSearch(filter: any) {
        this.poNotification.success(`Pesquisa avancada realizada!`);
  }
}
