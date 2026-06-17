import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { TenantUsersService } from './tenant-users.service';
import { CurrentTenant, TenantContext } from '../tenancy/tenant-context.decorator';
import { TenantContextGuard } from '../tenancy/tenant-context.guard';
import { ChannelGuard } from '../tenancy/channel.guard';
import { AllowedChannels } from '../tenancy/channel.decorator';
import { CreateTenantUserDto } from './dto/create-tenant-user.dto';
import { UpdateTenantUserDto } from './dto/update-tenant-user.dto';
import { ResetTenantUserPasswordDto } from './dto/reset-tenant-user-password.dto';

@Controller('tenant-admin/users')
@UseGuards(TenantContextGuard, ChannelGuard)
@AllowedChannels('backoffice')
export class TenantUsersController {
  constructor(private readonly tenantUsersService: TenantUsersService) {}

  @Get()
  list(@CurrentTenant() tenantContext: TenantContext) {
    return this.tenantUsersService.list(tenantContext);
  }

  @Post()
  create(@CurrentTenant() tenantContext: TenantContext, @Body() dto: CreateTenantUserDto) {
    return this.tenantUsersService.create(tenantContext, dto);
  }

  @Put(':id')
  update(
    @CurrentTenant() tenantContext: TenantContext,
    @Param('id') userId: string,
    @Body() dto: UpdateTenantUserDto,
  ) {
    return this.tenantUsersService.update(tenantContext, userId, dto);
  }

  @Put(':id/block')
  block(@CurrentTenant() tenantContext: TenantContext, @Param('id') userId: string) {
    return this.tenantUsersService.block(tenantContext, userId);
  }

  @Put(':id/unblock')
  unblock(@CurrentTenant() tenantContext: TenantContext, @Param('id') userId: string) {
    return this.tenantUsersService.unblock(tenantContext, userId);
  }

  @Put(':id/inactivate')
  inactivate(@CurrentTenant() tenantContext: TenantContext, @Param('id') userId: string) {
    return this.tenantUsersService.inactivate(tenantContext, userId);
  }

  @Put(':id/activate')
  activate(@CurrentTenant() tenantContext: TenantContext, @Param('id') userId: string) {
    return this.tenantUsersService.activate(tenantContext, userId);
  }

  @Put(':id/reset-password')
  resetPassword(
    @CurrentTenant() tenantContext: TenantContext,
    @Param('id') userId: string,
    @Body() dto: ResetTenantUserPasswordDto,
  ) {
    return this.tenantUsersService.resetPassword(tenantContext, userId, dto);
  }
}
