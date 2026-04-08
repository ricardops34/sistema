import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.company.findMany({
      where: { status: 'A' },
      include: { state: true, city: true },
      orderBy: { name: 'asc' },
    });
    return {
      items: data.map(({ state, city, ...rest }) => ({
        ...rest,
        stateName: state?.uf || '',
        cityName: city?.name || '',
      })),
    };
  }

  async findOne(id: number) {
    return this.prisma.company.findUnique({
      where: { id },
      include: {
        collaborators: {
          include: {
            collaborator: {
              include: { role: true }
            }
          }
        }
      }
    });
  }

  async create(data: any) {
    return this.prisma.company.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.company.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.company.update({
      where: { id },
      data: { status: 'I' },
    });
  }

  // --- Vínculo de Colaboradores ---
  async getCollaborators(companyId: number) {
    const links = await this.prisma.companyCollaborator.findMany({
      where: { companyId },
      include: {
        collaborator: {
          include: { role: true }
        }
      }
    });
    return links.map(l => ({
      id: l.id,
      collaboratorId: l.collaborator.id,
      name: l.collaborator.name,
      roleName: l.collaborator.role?.name || '',
      phone: l.collaborator.phone || '',
    }));
  }

  async addCollaborator(companyId: number, collaboratorId: number) {
    return this.prisma.companyCollaborator.create({
      data: { companyId, collaboratorId },
    });
  }

  async removeCollaborator(linkId: number) {
    return this.prisma.companyCollaborator.delete({ where: { id: linkId } });
  }
}
