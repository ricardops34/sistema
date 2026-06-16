import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { TenantBranding } from '../tenant-settings/entities/tenant-branding.entity';
import { TenantPersonPolicy } from '../tenant-settings/entities/tenant-person-policy.entity';
import { TenantUser } from '../authorization/entities/tenant-user.entity';
import { TenantRole } from '../authorization/entities/tenant-role.entity';
import { PlatformIdentity } from '../auth/entities/platform-identity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantBranding,
      TenantPersonPolicy,
      TenantUser,
      TenantRole,
      PlatformIdentity,
    ]),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
