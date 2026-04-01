# Padrões Protheus (ADVPL/REST/MDI)

Este documento orienta a integração de aplicações Angular + PO-UI com o backend Protheus.

## 🔗 Integração `protheus-lib-core`

### Uso de Serviços Básicos

**Injeção do Serviço:**
```typescript
import { ProAppConfigService } from '@protheus-lib-core';

constructor(private proAppConfigService: ProAppConfigService) {}
```

### Comandos de MDI (Multi-Document Interface)

**Fechar Abas Externas:**
```typescript
this.proAppConfigService.callAppClose();
```

**Abrir Rotinas Protheus:**
```typescript
this.proAppConfigService.callAppOpen({
    id: 'MATA010',
    title: 'Cadastro de Produtos'
});
```

## 📡 Padrão de API TOTVS (REST)

### Estrutura de Retorno (JSON)
As APIs Protheus devem retornar o padrão JSON especificado:
```json
{
    "items": [ ... ],
    "hasNext": true,
    "total": 100
}
```

### Mapeamento de Campos (Nomenclatura)
Embora as APIs Protheus usem campos como `A1_COD`, no Angular devemos preferencialmente mapear (via Service) para nomes amigáveis:
- `A1_COD` -> `code`
- `A1_NOME` -> `name`
- `A1_LOJA` -> `unit`

## ⏳ PoSync (Offline First)
Para aplicações que exigem sincronização offline, utilize o `PoSyncService` da biblioteca core para gerenciar o cache local e envio de logs de erro (`PoSyncLog`).
