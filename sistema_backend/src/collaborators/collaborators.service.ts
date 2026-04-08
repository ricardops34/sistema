import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollaboratorsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.collaborator.findMany({
      where: { status: 'A' },
      include: { role: true },
      orderBy: { name: 'asc' },
    });
    return {
      items: data.map(c => ({
        ...c,
        roleName: c.role?.name || '',
      })),
    };
  }

  async findOne(id: number) {
    return this.prisma.collaborator.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async create(data: any) {
    return this.prisma.collaborator.create({ data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp || false,
      roleId: data.roleId ? parseInt(data.roleId) : null,
      status: data.status || 'A',
    }});
  }

  async update(id: number, data: any) {
    return this.prisma.collaborator.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp,
        roleId: data.roleId ? parseInt(data.roleId) : null,
        status: data.status,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.collaborator.delete({ where: { id } });
  }
}
