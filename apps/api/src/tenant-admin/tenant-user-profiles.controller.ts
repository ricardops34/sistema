import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { TenantUsersService } from './tenant-users.service';
import { CurrentTenant, TenantContext } from '../tenancy/tenant-context.decorator';
import { TenantContextGuard } from '../tenancy/tenant-context.guard';
import { ChannelGuard } from '../tenancy/channel.guard';
import { AllowedChannels } from '../tenancy/channel.decorator';
import { UpdateTenantUserProfilesDto } from './dto/update-tenant-user-profiles.dto';

@Controller('tenant-admin/users/:id/profiles')
@UseGuards(TenantContextGuard, ChannelGuard)
@AllowedChannels('backoffice')
export class TenantUserProfilesController {
  constructor(private readonly tenantUsersService: TenantUsersService) {}

  @Get()
  list(@CurrentTenant() tenantContext: TenantContext, @Param('id') userId: string) {
    return this.tenantUsersService.getVisibleProfiles(tenantContext, userId);
  }

  @Put()
  replace(
    @CurrentTenant() tenantContext: TenantContext,
    @Param('id') userId: string,
    @Body() dto: UpdateTenantUserProfilesDto,
  ) {
    return this.tenantUsersService.replaceProfiles(tenantContext, userId, dto.profileIds);
  }
}
