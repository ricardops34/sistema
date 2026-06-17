import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantUser } from '../authorization/entities/tenant-user.entity';
import { AppRoutineEntity } from '../access-catalog/entities/app-routine.entity';
import { AppRoutineActionEntity } from '../access-catalog/entities/app-routine-action.entity';
import { TenantProfileEntity } from './entities/tenant-profile.entity';
import { TenantProfileRoutineGrantEntity } from './entities/tenant-profile-routine-grant.entity';
import { TenantProfileActionGrantEntity } from './entities/tenant-profile-action-grant.entity';
import { TenantUserProfileEntity } from './entities/tenant-user-profile.entity';
import { TenantUserRoutineOverrideEntity } from './entities/tenant-user-routine-override.entity';
import { TenantUserActionOverrideEntity } from './entities/tenant-user-action-override.entity';
import { AccessResolutionService } from './access-resolution.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantUser,
      AppRoutineEntity,
      AppRoutineActionEntity,
      TenantProfileEntity,
      TenantProfileRoutineGrantEntity,
      TenantProfileActionGrantEntity,
      TenantUserProfileEntity,
      TenantUserRoutineOverrideEntity,
      TenantUserActionOverrideEntity,
    ]),
  ],
  providers: [AccessResolutionService],
  exports: [AccessResolutionService],
})
export class AccessControlModule {}
