import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeopleMetadataController } from './people-metadata.controller';
import { PeopleMetadataService } from './people-metadata.service';
import { TenantPersonDocumentType } from './entities/tenant-person-document-type.entity';
import { TenantPersonContextCodeType } from './entities/tenant-person-context-code-type.entity';
import { TenantFieldRule } from './entities/tenant-field-rule.entity';
import { TenantPersonPolicy } from '../tenant-settings/entities/tenant-person-policy.entity';
import { TenancyModule } from '../tenancy/tenancy.module';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantPersonDocumentType,
      TenantPersonContextCodeType,
      TenantFieldRule,
      TenantPersonPolicy,
    ]),
    TenancyModule,
    AccessControlModule,
  ],
  controllers: [PeopleMetadataController],
  providers: [PeopleMetadataService],
  exports: [PeopleMetadataService],
})
export class PeopleMetadataModule {}
