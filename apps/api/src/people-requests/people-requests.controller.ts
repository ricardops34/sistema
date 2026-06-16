import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { TenantContextGuard } from '../tenancy/tenant-context.guard';
import { CurrentTenant, TenantContext } from '../tenancy/tenant-context.decorator';
import { PeopleRequestsService } from './people-requests.service';

@Controller('people-requests')
@UseGuards(TenantContextGuard)
export class PeopleRequestsController {
  constructor(private readonly service: PeopleRequestsService) {}

  @Post()
  create(@CurrentTenant() ctx: TenantContext, @Body() dto: { personId: string; payload: Record<string, unknown> }) {
    return this.service.create(ctx.tenantId, dto.personId, ctx.identityId, dto.payload);
  }

  @Get()
  findAll(@CurrentTenant() ctx: TenantContext) {
    return this.service.findAll(ctx.tenantId);
  }

  @Get(':id')
  findOne(@CurrentTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.service.findOne(ctx.tenantId, id);
  }
}
