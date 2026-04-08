import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.state.findMany({ orderBy: { uf: 'asc' } });
    return { items: data };
  }

  async findOne(id: number) {
    return this.prisma.state.findUnique({ where: { id } });
  }
}
