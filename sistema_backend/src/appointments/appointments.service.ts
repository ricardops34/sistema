import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.appointment.findMany({
      include: {
        company: true,
        professional: true,
      },
    });

    // Mapeamento para o formato esperado pelo PO-UI / FullCalendar no frontend
    return {
      items: data.map((item) => ({
        id: item.id,
        descricao: item.description,
        horario_inicial: item.initialTime,
        horario_final: item.finalTime,
        tipo: item.type,
        status: item.status,
        cor: item.color,
        observacao: item.notes,
        empresa: item.company.name,
        profissional: item.professional.name,
        companyId: item.companyId,
        professionalId: item.professionalId,
      })),
    };
  }

  async findOne(id: number) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: {
        company: true,
        professional: true,
      },
    });
  }

  async create(data: any) {
    // Garantir que as datas sejam objetos Date
    const appointmentData = {
      ...data,
      initialTime: new Date(data.initialTime),
      finalTime: new Date(data.finalTime),
      date: new Date(data.initialTime), // Usa a data de início para o campo date
    };

    // Remove campos que não existem no Prisma se vierem do frontend
    delete appointmentData.horario_inicial;
    delete appointmentData.horario_final;
    delete appointmentData.descricao;

    return this.prisma.appointment.create({
      data: {
        description: data.descricao || data.description,
        initialTime: new Date(data.horario_inicial || data.initialTime),
        finalTime: new Date(data.horario_final || data.finalTime),
        type: data.tipo || data.type || 'A',
        status: data.status || 'P',
        color: data.cor || data.color,
        notes: data.observacao || data.notes,
        companyId: Number(data.companyId),
        professionalId: Number(data.professionalId),
        date: new Date(data.horario_inicial || data.initialTime),
      },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.appointment.update({
      where: { id },
      data: {
        description: data.descricao || data.description,
        initialTime: data.horario_inicial ? new Date(data.horario_inicial) : undefined,
        finalTime: data.horario_final ? new Date(data.horario_final) : undefined,
        type: data.tipo || data.type,
        status: data.status,
        color: data.cor || data.color,
        notes: data.observacao || data.notes,
        companyId: data.companyId ? Number(data.companyId) : undefined,
        professionalId: data.professionalId ? Number(data.professionalId) : undefined,
        date: data.horario_inicial ? new Date(data.horario_inicial) : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.appointment.delete({
      where: { id },
    });
  }
}
