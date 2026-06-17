import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { TenantContextGuard } from '../tenancy/tenant-context.guard';
import { ChannelGuard } from '../tenancy/channel.guard';
import { AllowedChannels } from '../tenancy/channel.decorator';
import { CurrentTenant, TenantContext } from '../tenancy/tenant-context.decorator';
import { ScopesGuard } from '../authorization/scopes.guard';
import { RequireScopes } from '../authorization/scopes.decorator';
import { PeopleRequestsService } from './people-requests.service';

@Controller('people-requests')
@UseGuards(TenantContextGuard, ChannelGuard, ScopesGuard)
@AllowedChannels('portal')
export class PeopleRequestsController {
  constructor(private readonly service: PeopleRequestsService) {}

  @Post()
  @RequireScopes('people.request.create', '*')
  create(@CurrentTenant() ctx: TenantContext, @Body() dto: { personId: string; payload: Record<string, unknown> }) {
    return this.service.create(ctx.tenantId, ctx.tenantUserId, dto.personId, ctx.identityId, dto.payload);
  }

  @Get()
  @RequireScopes('people.request.read', '*')
  findAll(@CurrentTenant() ctx: TenantContext) {
    return this.service.findAll(ctx.tenantId);
  }

  @Get(':id')
  @RequireScopes('people.request.read', '*')
  findOne(@CurrentTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.service.findOne(ctx.tenantId, id);
  }
}
