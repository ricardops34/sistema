import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.role.findMany({
      where: { status: 'A' },
      orderBy: { name: 'asc' },
    });
    return { items: data };
  }

  async findOne(id: number) {
    return this.prisma.role.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.role.create({ data: { name: data.name, status: data.status || 'A' } });
  }

  async update(id: number, data: any) {
    return this.prisma.role.update({ where: { id }, data: { name: data.name, status: data.status } });
  }

  async remove(id: number) {
    return this.prisma.role.delete({ where: { id } });
  }
}
