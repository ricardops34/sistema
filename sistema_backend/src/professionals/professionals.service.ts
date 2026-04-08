// src/professionals/professionals.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfessionalsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.professional.findMany({
      where: { status: 'A' },
      orderBy: { name: 'asc' },
    });
    return { items: data };
  }

  async findOne(id: number) {
    return this.prisma.professional.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return this.prisma.professional.create({
      data,
    });
  }

  async update(id: number, data: any) {
    return this.prisma.professional.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.professional.update({
      where: { id },
      data: { status: 'I' },
    });
  }
}
