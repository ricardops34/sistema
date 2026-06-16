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
  ],
  controllers: [HealthController],
})
export class AppModule {}
