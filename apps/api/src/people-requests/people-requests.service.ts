import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonUpdateRequest } from './entities/person-update-request.entity';
import { TenantUser } from '../authorization/entities/tenant-user.entity';

@Injectable()
export class PeopleRequestsService {
  constructor(
    @InjectRepository(PersonUpdateRequest)
    private requestRepo: Repository<PersonUpdateRequest>,
    @InjectRepository(TenantUser)
    private tenantUserRepo: Repository<TenantUser>,
  ) {}

  async create(
    tenantId: string,
    tenantUserId: string,
    personId: string,
    requesterIdentityId: string,
    payload: Record<string, unknown>,
  ) {
    const tenantUser = await this.tenantUserRepo.findOne({
      where: {
        id: tenantUserId,
        tenantId,
        channel: 'portal',
        isActive: true,
      },
    });

    if (!tenantUser || !tenantUser.personId || tenantUser.personId !== personId) {
      throw new ForbiddenException('Usuário do portal não pode solicitar atualização para esta pessoa');
    }

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
