import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { TenantContextGuard } from '../tenancy/tenant-context.guard';
import { CurrentTenant, TenantContext } from '../tenancy/tenant-context.decorator';
import { PeopleMetadataService } from './people-metadata.service';

@Controller('people-metadata')
@UseGuards(TenantContextGuard)
export class PeopleMetadataController {
  constructor(private readonly service: PeopleMetadataService) {}

  @Get()
  getMetadata(@CurrentTenant() ctx: TenantContext) {
    return this.service.getMetadata(ctx.tenantId);
  }

  @Put('policy')
  updatePolicy(@CurrentTenant() ctx: TenantContext, @Body() dto: Record<string, unknown>) {
    return this.service.updatePolicy(ctx.tenantId, dto);
  }

  @Put('document-types')
  updateDocumentTypes(@CurrentTenant() ctx: TenantContext, @Body() dto: { items: Record<string, unknown>[] }) {
    return this.service.updateDocumentTypes(ctx.tenantId, dto.items);
  }

  @Put('context-code-types')
  updateContextCodeTypes(@CurrentTenant() ctx: TenantContext, @Body() dto: { items: Record<string, unknown>[] }) {
    return this.service.updateContextCodeTypes(ctx.tenantId, dto.items);
  }
}
