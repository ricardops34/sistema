import { Controller, Get, Post, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { TenantContextGuard } from '../tenancy/tenant-context.guard';
import { CurrentTenant, TenantContext } from '../tenancy/tenant-context.decorator';
import { PeopleService } from './people.service';
import { CreatePersonDto } from './dto/create-person.dto';

@Controller('people')
@UseGuards(TenantContextGuard)
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  findAll(
    @CurrentTenant() ctx: TenantContext,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.peopleService.findAll(ctx.tenantId, parseInt(page), parseInt(limit));
  }

  @Get(':id')
  findOne(@CurrentTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.peopleService.findOne(ctx.tenantId, id);
  }

  @Post()
  create(@CurrentTenant() ctx: TenantContext, @Body() dto: CreatePersonDto) {
    return this.peopleService.create(ctx.tenantId, dto, ctx.tenantUserId);
  }

  @Patch(':id')
  update(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: Partial<CreatePersonDto>,
  ) {
    return this.peopleService.update(ctx.tenantId, id, dto, ctx.tenantUserId);
  }
}
