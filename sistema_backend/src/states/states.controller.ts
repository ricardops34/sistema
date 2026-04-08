import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { StatesService } from './states.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('v1/states')
@UseGuards(JwtAuthGuard)
export class StatesController {
  constructor(private readonly service: StatesService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
