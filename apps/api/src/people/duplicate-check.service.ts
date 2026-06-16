import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './entities/person.entity';
import { TenantPersonPolicy } from '../tenant-settings/entities/tenant-person-policy.entity';

export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicates: Person[];
  mode: string;
}

@Injectable()
export class DuplicateCheckService {
  constructor(
    @InjectRepository(Person)
    private personRepo: Repository<Person>,
    @InjectRepository(TenantPersonPolicy)
    private policyRepo: Repository<TenantPersonPolicy>,
  ) {}

  async check(tenantId: string, nameLegal: string, excludeId?: string): Promise<DuplicateCheckResult> {
    const policy = await this.policyRepo.findOne({ where: { tenantId } });
    const criteria = policy?.duplicateCheckCriteria ?? ['name'];
    const mode = policy?.duplicateCheckMode ?? 'alert';

    if (!criteria.includes('name')) {
      return { hasDuplicates: false, duplicates: [], mode };
    }

    const qb = this.personRepo
      .createQueryBuilder('p')
      .where('p.tenant_id = :tenantId', { tenantId })
      .andWhere('p.is_active = true')
      .andWhere('LOWER(p.name_legal) = LOWER(:nameLegal)', { nameLegal });

    if (excludeId) {
      qb.andWhere('p.id != :excludeId', { excludeId });
    }

    const duplicates = await qb.getMany();
    const hasDuplicates = duplicates.length > 0;

    if (hasDuplicates && mode === 'block') {
      throw new ConflictException({
        message: 'Duplicidade detectada conforme política do tenant',
        duplicates: duplicates.map((d) => ({ id: d.id, internalCode: d.internalCode, nameLegal: d.nameLegal })),
      });
    }

    return { hasDuplicates, duplicates, mode };
  }
}
