import { Module } from '@nestjs/common';
import { PeopleController } from './people.controller';
import { TenancyModule } from '../tenancy/tenancy.module';

@Module({
  imports: [TenancyModule],
  controllers: [PeopleController],
})
export class PeopleModule {}
