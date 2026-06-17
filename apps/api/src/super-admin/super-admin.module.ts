import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SuperAdminGuard } from './super-admin.guard';
import { SuperAdminProfilesController } from './super-admin-profiles.controller';
import { SuperAdminProfilesService } from './super-admin-profiles.service';
import { SuperAdminCatalogController } from './super-admin-catalog.controller';
import { SuperAdminCatalogService } from './super-admin-catalog.service';

@Module({
  imports: [AuthModule],
  controllers: [SuperAdminProfilesController, SuperAdminCatalogController],
  providers: [SuperAdminGuard, SuperAdminProfilesService, SuperAdminCatalogService],
  exports: [SuperAdminProfilesService],
})
export class SuperAdminModule {}
