import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Query } from '@nestjs/common';

@Injectable()
export class CitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(stateId?: number) {
    const where = stateId ? { stateId } : {};
    const data = await this.prisma.city.findMany({
      where,
      include: { state: true },
      orderBy: { name: 'asc' },
    });
    return {
      items: data.map(c => ({
        ...c,
        stateName: c.state?.name || '',
        stateUf: c.state?.uf || '',
      })),
    };
  }

  async findOne(id: number) {
    return this.prisma.city.findUnique({
      where: { id },
      include: { state: true },
    });
  }
}
