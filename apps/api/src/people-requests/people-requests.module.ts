import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeopleRequestsController } from './people-requests.controller';
import { PeopleRequestsService } from './people-requests.service';
import { PersonUpdateRequest } from './entities/person-update-request.entity';
import { TenancyModule } from '../tenancy/tenancy.module';
import { TenantUser } from '../authorization/entities/tenant-user.entity';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PersonUpdateRequest, TenantUser]),
    TenancyModule,
    AccessControlModule,
  ],
  controllers: [PeopleRequestsController],
  providers: [PeopleRequestsService],
  exports: [PeopleRequestsService],
})
export class PeopleRequestsModule {}
