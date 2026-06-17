import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { TenantUsersService } from './tenant-users.service';
import { CurrentTenant, TenantContext } from '../tenancy/tenant-context.decorator';
import { TenantContextGuard } from '../tenancy/tenant-context.guard';
import { ChannelGuard } from '../tenancy/channel.guard';
import { AllowedChannels } from '../tenancy/channel.decorator';
import { UpdateTenantSettingsDto } from './dto/update-tenant-settings.dto';

@Controller('tenant-admin/tenant')
@UseGuards(TenantContextGuard, ChannelGuard)
@AllowedChannels('backoffice')
export class TenantSettingsController {
  constructor(private readonly tenantUsersService: TenantUsersService) {}

  @Get()
  getTenant(@CurrentTenant() tenantContext: TenantContext) {
    return this.tenantUsersService.getTenantSettings(tenantContext);
  }

  @Put()
  updateTenant(
    @CurrentTenant() tenantContext: TenantContext,
    @Body() dto: UpdateTenantSettingsDto,
  ) {
    return this.tenantUsersService.updateTenantSettings(tenantContext, dto);
  }
}
