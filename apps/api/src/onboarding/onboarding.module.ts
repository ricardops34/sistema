import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { TenantBranding } from '../tenant-settings/entities/tenant-branding.entity';
import { TenantPersonPolicy } from '../tenant-settings/entities/tenant-person-policy.entity';
import { TenantUser } from '../authorization/entities/tenant-user.entity';
import { TenantRole } from '../authorization/entities/tenant-role.entity';
import { PlatformIdentity } from '../auth/entities/platform-identity.entity';
import { TenantProfileEntity } from '../access-control/entities/tenant-profile.entity';
import { TenantProfileRoutineGrantEntity } from '../access-control/entities/tenant-profile-routine-grant.entity';
import { TenantProfileActionGrantEntity } from '../access-control/entities/tenant-profile-action-grant.entity';
import { TenantUserProfileEntity } from '../access-control/entities/tenant-user-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantBranding,
      TenantPersonPolicy,
      TenantUser,
      TenantRole,
      PlatformIdentity,
      TenantProfileEntity,
      TenantProfileRoutineGrantEntity,
      TenantProfileActionGrantEntity,
      TenantUserProfileEntity,
    ]),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
