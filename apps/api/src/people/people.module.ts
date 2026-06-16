import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeopleController } from './people.controller';
import { PeopleService } from './people.service';
import { Person } from './entities/person.entity';
import { PersonContact } from './entities/person-contact.entity';
import { PersonDocument } from './entities/person-document.entity';
import { TenancyModule } from '../tenancy/tenancy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Person, PersonContact, PersonDocument]),
    TenancyModule,
  ],
  controllers: [PeopleController],
  providers: [PeopleService],
  exports: [PeopleService],
})
export class PeopleModule {}
