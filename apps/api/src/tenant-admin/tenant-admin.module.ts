import { Module } from '@nestjs/common';
import { TenancyModule } from '../tenancy/tenancy.module';
import { AccessControlModule } from '../access-control/access-control.module';
import { TenantUsersController } from './tenant-users.controller';
import { TenantUsersService } from './tenant-users.service';
import { TenantUserProfilesController } from './tenant-user-profiles.controller';
import { TenantSettingsController } from './tenant-settings.controller';

@Module({
  imports: [TenancyModule, AccessControlModule],
  controllers: [TenantUsersController, TenantUserProfilesController, TenantSettingsController],
  providers: [TenantUsersService],
  exports: [TenantUsersService],
})
export class TenantAdminModule {}
