import { Controller, Get, Post, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { TenantContextGuard } from '../tenancy/tenant-context.guard';
import { ChannelGuard } from '../tenancy/channel.guard';
import { AllowedChannels } from '../tenancy/channel.decorator';
import { CurrentTenant, TenantContext } from '../tenancy/tenant-context.decorator';
import { ScopesGuard } from '../authorization/scopes.guard';
import { RequireScopes } from '../authorization/scopes.decorator';
import { PeopleService } from './people.service';
import { CreatePersonDto } from './dto/create-person.dto';

@Controller('people')
@UseGuards(TenantContextGuard, ChannelGuard, ScopesGuard)
@AllowedChannels('backoffice')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  @RequireScopes('people.read', '*')
  findAll(
    @CurrentTenant() ctx: TenantContext,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.peopleService.findAll(ctx.tenantId, parseInt(page), parseInt(limit));
  }

  @Get(':id')
  @RequireScopes('people.read', '*')
  findOne(@CurrentTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.peopleService.findOne(ctx.tenantId, id);
  }

  @Post()
  @RequireScopes('people.create', '*')
  create(@CurrentTenant() ctx: TenantContext, @Body() dto: CreatePersonDto) {
    return this.peopleService.create(ctx.tenantId, dto, ctx.tenantUserId);
  }

  @Patch(':id')
  @RequireScopes('people.update', '*')
  update(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: Partial<CreatePersonDto>,
  ) {
    return this.peopleService.update(ctx.tenantId, id, dto, ctx.tenantUserId);
  }
}
