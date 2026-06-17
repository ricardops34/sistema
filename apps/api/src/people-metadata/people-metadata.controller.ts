import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { TenantContextGuard } from '../tenancy/tenant-context.guard';
import { ChannelGuard } from '../tenancy/channel.guard';
import { AllowedChannels } from '../tenancy/channel.decorator';
import { CurrentTenant, TenantContext } from '../tenancy/tenant-context.decorator';
import { ScopesGuard } from '../authorization/scopes.guard';
import { RequireScopes } from '../authorization/scopes.decorator';
import { PeopleMetadataService } from './people-metadata.service';

@Controller('people-metadata')
@UseGuards(TenantContextGuard, ChannelGuard, ScopesGuard)
@AllowedChannels('backoffice')
export class PeopleMetadataController {
  constructor(private readonly service: PeopleMetadataService) {}

  @Get()
  @RequireScopes('people.metadata.read', '*')
  getMetadata(@CurrentTenant() ctx: TenantContext) {
    return this.service.getMetadata(ctx.tenantId);
  }

  @Put('policy')
  @RequireScopes('people.metadata.manage', '*')
  updatePolicy(@CurrentTenant() ctx: TenantContext, @Body() dto: Record<string, unknown>) {
    return this.service.updatePolicy(ctx.tenantId, dto);
  }

  @Put('document-types')
  @RequireScopes('people.metadata.manage', '*')
  updateDocumentTypes(@CurrentTenant() ctx: TenantContext, @Body() dto: { items: Record<string, unknown>[] }) {
    return this.service.updateDocumentTypes(ctx.tenantId, dto.items);
  }

  @Put('context-code-types')
  @RequireScopes('people.metadata.manage', '*')
  updateContextCodeTypes(@CurrentTenant() ctx: TenantContext, @Body() dto: { items: Record<string, unknown>[] }) {
    return this.service.updateContextCodeTypes(ctx.tenantId, dto.items);
  }
}
