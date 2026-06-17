import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from './super-admin.guard';
import { SuperAdminCatalogService } from './super-admin-catalog.service';
import {
  ManageCatalogGroupDto,
  ManageCatalogModuleDto,
  ManageCatalogRoutineDto,
  ManageRoutineActionsDto,
} from './dto/manage-catalog.dto';

@Controller('super-admin/catalog')
@UseGuards(SuperAdminGuard)
export class SuperAdminCatalogController {
  constructor(private readonly superAdminCatalogService: SuperAdminCatalogService) {}

  @Get('modules')
  listModules() {
    return this.superAdminCatalogService.listModules();
  }

  @Post('modules')
  createModule(@Body() body: ManageCatalogModuleDto) {
    return this.superAdminCatalogService.createModule(body);
  }

  @Put('modules/:id')
  updateModule(@Param('id') moduleId: string, @Body() body: ManageCatalogModuleDto) {
    return this.superAdminCatalogService.updateModule(moduleId, body);
  }

  @Get('groups')
  listGroups() {
    return this.superAdminCatalogService.listGroups();
  }

  @Post('groups')
  createGroup(@Body() body: ManageCatalogGroupDto) {
    return this.superAdminCatalogService.createGroup(body);
  }

  @Put('groups/:id')
  updateGroup(@Param('id') groupId: string, @Body() body: ManageCatalogGroupDto) {
    return this.superAdminCatalogService.updateGroup(groupId, body);
  }

  @Get('routines')
  listRoutines() {
    return this.superAdminCatalogService.listRoutines();
  }

  @Post('routines')
  createRoutine(@Body() body: ManageCatalogRoutineDto) {
    return this.superAdminCatalogService.createRoutine(body);
  }

  @Put('routines/:id')
  updateRoutine(@Param('id') routineId: string, @Body() body: ManageCatalogRoutineDto) {
    return this.superAdminCatalogService.updateRoutine(routineId, body);
  }

  @Put('routines/:id/actions')
  replaceRoutineActions(@Param('id') routineId: string, @Body() body: ManageRoutineActionsDto) {
    return this.superAdminCatalogService.replaceRoutineActions(routineId, body.actions ?? []);
  }
}
