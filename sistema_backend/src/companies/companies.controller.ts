import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('v1/companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.companiesService.create(body);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.companiesService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.remove(id);
  }

  // --- Colaboradores vinculados ---
  @Get(':id/collaborators')
  async getCollaborators(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.getCollaborators(id);
  }

  @Post(':id/collaborators')
  async addCollaborator(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.companiesService.addCollaborator(id, body.collaboratorId);
  }

  @Delete(':companyId/collaborators/:linkId')
  async removeCollaborator(@Param('linkId', ParseIntPipe) linkId: number) {
    return this.companiesService.removeCollaborator(linkId);
  }
}
