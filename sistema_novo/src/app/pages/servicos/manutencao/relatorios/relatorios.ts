import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoPageDynamicSearchModule, PoPageDynamicTableField } from '@po-ui/ng-templates';
import { PoBreadcrumb, PoNotificationService } from '@po-ui/ng-components';

@Component({
    selector: 'app-relatorios',
    standalone: true,
    imports: [CommonModule, PoPageDynamicSearchModule],
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
                                                                  <p class="po-font-text">Selecione filtros.</p>
                                                                          </div>
                                                                                </div>
                                                                                    </po-page-dynamic-search>
                                                                                      `
})
  export class Relatorios {
    public breadcrumb: PoBreadcrumb = {
          items: [
            { label: 'Home', link: '/' },
            { label: 'Relatorios' }
                ]
    };

  public fields: Array<any> = [
    { property: 'f', label: 'Filtro' }
      ];

  constructor(private poNotification: PoNotificationService) {}

  onQuickSearch(f: string) {}
    onAdvancedSearch(f: any) {}
}
