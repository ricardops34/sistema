import { Controller, Get, UseGuards } from '@nestjs/common';
import { TenantContextGuard } from '../tenancy/tenant-context.guard';
import { CurrentTenant, TenantContext } from '../tenancy/tenant-context.decorator';

@Controller('people')
@UseGuards(TenantContextGuard)
export class PeopleController {
  @Get()
  findAll(@CurrentTenant() ctx: TenantContext) {
    return { items: [], tenantId: ctx.tenantId };
  }
}
