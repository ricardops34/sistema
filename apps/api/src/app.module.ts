import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { envSchema } from './config/env.schema';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { TenancyModule } from './tenancy/tenancy.module';
import { PeopleModule } from './people/people.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { PeopleMetadataModule } from './people-metadata/people-metadata.module';
import { PeopleRequestsModule } from './people-requests/people-requests.module';
import { AuditModule } from './audit/audit.module';
import { AccessControlModule } from './access-control/access-control.module';
import { MeModule } from './me/me.module';
import { TenantAdminModule } from './tenant-admin/tenant-admin.module';
import { SuperAdminModule } from './super-admin/super-admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
    }),
    DatabaseModule,
    AuthModule,
    TenancyModule,
    PeopleModule,
    OnboardingModule,
    PeopleMetadataModule,
    PeopleRequestsModule,
    AuditModule,
    AccessControlModule,
    MeModule,
    TenantAdminModule,
    SuperAdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
