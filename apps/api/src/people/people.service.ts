import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Person } from './entities/person.entity';
import { CreatePersonDto } from './dto/create-person.dto';

@Injectable()
export class PeopleService {
  constructor(
    @InjectRepository(Person)
    private personRepo: Repository<Person>,
    private dataSource: DataSource,
  ) {}

  async create(tenantId: string, dto: CreatePersonDto, createdBy: string) {
    const internalCode = await this.generateInternalCode(tenantId);

    const person = this.personRepo.create({
      tenantId,
      internalCode,
      nameLegal: dto.nameLegal,
      nameSocial: dto.nameSocial,
      birthDate: dto.birthDate,
      gender: dto.gender,
      notes: dto.notes,
      createdBy,
      updatedBy: createdBy,
      isActive: true,
    });

    return this.personRepo.save(person);
  }

  async findAll(tenantId: string, page = 1, limit = 20) {
    const [items, total] = await this.personRepo.findAndCount({
      where: { tenantId, isActive: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async findOne(tenantId: string, id: string) {
    return this.personRepo.findOne({ where: { tenantId, id, isActive: true } });
  }

  async update(tenantId: string, id: string, dto: Partial<CreatePersonDto>, updatedBy: string) {
    const person = await this.personRepo.findOne({ where: { tenantId, id } });
    if (!person) return null;
    Object.assign(person, dto, { updatedBy });
    return this.personRepo.save(person);
  }

  private async generateInternalCode(tenantId: string): Promise<string> {
    const result = await this.dataSource.query(
      `SELECT nextval('person_internal_code_seq') AS code`,
    );
    const seq = result[0].code;
    return `P${tenantId.substring(0, 4).toUpperCase()}-${String(seq).padStart(6, '0')}`;
  }
}
