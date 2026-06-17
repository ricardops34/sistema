import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeopleController } from './people.controller';
import { PeopleService } from './people.service';
import { Person } from './entities/person.entity';
import { PersonContact } from './entities/person-contact.entity';
import { PersonDocument } from './entities/person-document.entity';
import { TenancyModule } from '../tenancy/tenancy.module';
import { AccessControlModule } from '../access-control/access-control.module';
import { DuplicateCheckService } from './duplicate-check.service';
import { PersonContextCode } from './entities/person-context-code.entity';
import { TenantPersonPolicy } from '../tenant-settings/entities/tenant-person-policy.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Person, PersonContact, PersonDocument, PersonContextCode, TenantPersonPolicy]),
    TenancyModule,
    AccessControlModule,
  ],
  controllers: [PeopleController],
  providers: [PeopleService, DuplicateCheckService],
  exports: [PeopleService, DuplicateCheckService],
})
export class PeopleModule {}
