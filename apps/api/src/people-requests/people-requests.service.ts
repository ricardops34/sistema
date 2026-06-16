import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonUpdateRequest } from './entities/person-update-request.entity';

@Injectable()
export class PeopleRequestsService {
  constructor(
    @InjectRepository(PersonUpdateRequest)
    private requestRepo: Repository<PersonUpdateRequest>,
  ) {}

  async create(tenantId: string, personId: string, requesterIdentityId: string, payload: Record<string, unknown>) {
    const req = this.requestRepo.create({
      tenantId,
      personId,
      requesterIdentityId,
      payload,
      status: 'pending',
    });
    return this.requestRepo.save(req);
  }

  async findAll(tenantId: string) {
    return this.requestRepo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  async findOne(tenantId: string, id: string) {
    return this.requestRepo.findOne({ where: { tenantId, id } });
  }
}
