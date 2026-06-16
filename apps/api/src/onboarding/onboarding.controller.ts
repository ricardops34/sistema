import { Controller, Post, Body } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('tenants')
  createTenant(@Body() dto: CreateTenantDto) {
    return this.onboardingService.createTenant(dto);
  }
}
