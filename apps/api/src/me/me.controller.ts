import { Controller, Get, UseGuards } from '@nestjs/common';
import { MeService } from './me.service';
import { CurrentTenant, TenantContext } from '../tenancy/tenant-context.decorator';
import { TenantContextGuard } from '../tenancy/tenant-context.guard';

@Controller('me')
@UseGuards(TenantContextGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get('menu')
  async getMenu(@CurrentTenant() tenantContext: TenantContext) {
    return this.meService.getMenu(tenantContext);
  }

  @Get('permissions')
  getPermissions(@CurrentTenant() tenantContext: TenantContext) {
    return this.meService.getPermissions(tenantContext);
  }
}
