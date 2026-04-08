import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { ProfessionalsModule } from './professionals/professionals.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { CollaboratorsModule } from './collaborators/collaborators.module';
import { RolesModule } from './roles/roles.module';
import { StatesModule } from './states/states.module';
import { CitiesModule } from './cities/cities.module';

@Module({
  imports: [
    AuthModule,
    CompaniesModule,
    ProfessionalsModule,
    AppointmentsModule,
    CollaboratorsModule,
    RolesModule,
    StatesModule,
    CitiesModule
  ],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService]
})
export class AppModule {}


