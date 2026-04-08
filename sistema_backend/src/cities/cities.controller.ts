import { Controller, Get, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('v1/cities')
@UseGuards(JwtAuthGuard)
export class CitiesController {
  constructor(private readonly service: CitiesService) {}

  @Get()
  async findAll(@Query('stateId') stateId?: string) {
    return this.service.findAll(stateId ? parseInt(stateId) : undefined);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
