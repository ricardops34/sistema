import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { SuperAdminProfilesService } from './super-admin-profiles.service';
import { SuperAdminGuard } from './super-admin.guard';

@Controller('super-admin')
@UseGuards(SuperAdminGuard)
export class SuperAdminProfilesController {
  constructor(private readonly superAdminProfilesService: SuperAdminProfilesService) {}

  @Get('profiles')
  listProfiles(@Query('tenantId') tenantId?: string) {
    return this.superAdminProfilesService.listProfiles(tenantId);
  }

  @Post('profiles')
  createProfile(@Body() body: any) {
    return this.superAdminProfilesService.createProfile(body);
  }

  @Put('profiles/:id')
  updateProfile(@Param('id') profileId: string, @Body() body: any) {
    return this.superAdminProfilesService.updateProfile(profileId, body);
  }

  @Put('profiles/:id/routines')
  replaceRoutineGrants(@Param('id') profileId: string, @Body() body: { routineIds: string[] }) {
    return this.superAdminProfilesService.replaceRoutineGrants(profileId, body.routineIds ?? []);
  }

  @Put('profiles/:id/actions')
  replaceActionGrants(@Param('id') profileId: string, @Body() body: { actionIds: string[] }) {
    return this.superAdminProfilesService.replaceActionGrants(profileId, body.actionIds ?? []);
  }

  @Put('users/:id/profiles')
  replaceUserProfiles(
    @Param('id') tenantUserId: string,
    @Body() body: { tenantId: string; profileIds: Array<{ id: string; isLockedByPlatform?: boolean }> },
  ) {
    return this.superAdminProfilesService.replaceUserProfiles(
      tenantUserId,
      body.tenantId,
      body.profileIds ?? [],
    );
  }

  @Put('users/:id/overrides')
  replaceUserOverrides(@Param('id') tenantUserId: string, @Body() body: any) {
    return this.superAdminProfilesService.replaceUserOverrides(
      tenantUserId,
      body.tenantId,
      body.overrides ?? {},
    );
  }
}
