import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('v1/professionals')
@UseGuards(JwtAuthGuard)
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Get()
  async findAll() {
    return this.professionalsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.professionalsService.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.professionalsService.create(body);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.professionalsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.professionalsService.remove(id);
  }
}
