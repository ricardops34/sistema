import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantPersonDocumentType } from './entities/tenant-person-document-type.entity';
import { TenantPersonContextCodeType } from './entities/tenant-person-context-code-type.entity';
import { TenantFieldRule } from './entities/tenant-field-rule.entity';
import { TenantPersonPolicy } from '../tenant-settings/entities/tenant-person-policy.entity';

@Injectable()
export class PeopleMetadataService {
  constructor(
    @InjectRepository(TenantPersonDocumentType)
    private docTypeRepo: Repository<TenantPersonDocumentType>,
    @InjectRepository(TenantPersonContextCodeType)
    private codeTypeRepo: Repository<TenantPersonContextCodeType>,
    @InjectRepository(TenantFieldRule)
    private fieldRuleRepo: Repository<TenantFieldRule>,
    @InjectRepository(TenantPersonPolicy)
    private policyRepo: Repository<TenantPersonPolicy>,
  ) {}

  async getMetadata(tenantId: string) {
    const [documentTypes, contextCodeTypes, fieldRules, policy] = await Promise.all([
      this.docTypeRepo.find({ where: { tenantId, isActive: true } }),
      this.codeTypeRepo.find({ where: { tenantId, isActive: true } }),
      this.fieldRuleRepo.find({ where: { tenantId } }),
      this.policyRepo.findOne({ where: { tenantId } }),
    ]);

    return { documentTypes, contextCodeTypes, fieldRules, policy };
  }

  async updatePolicy(tenantId: string, data: Record<string, unknown>) {
    let policy = await this.policyRepo.findOne({ where: { tenantId } });
    if (!policy) {
      policy = this.policyRepo.create({ tenantId });
    }
    Object.assign(policy, data);
    return this.policyRepo.save(policy);
  }

  async updateDocumentTypes(tenantId: string, items: Record<string, unknown>[]) {
    await this.docTypeRepo.update({ tenantId }, { isActive: false });
    const saved = await Promise.all(
      items.map((item) => {
        const entity = this.docTypeRepo.create({ tenantId, ...item, isActive: true } as Partial<TenantPersonDocumentType>);
        return this.docTypeRepo.save(entity);
      }),
    );
    return { items: saved };
  }

  async updateContextCodeTypes(tenantId: string, items: Record<string, unknown>[]) {
    await this.codeTypeRepo.update({ tenantId }, { isActive: false });
    const saved = await Promise.all(
      items.map((item) => {
        const entity = this.codeTypeRepo.create({ tenantId, ...item, isActive: true } as Partial<TenantPersonContextCodeType>);
        return this.codeTypeRepo.save(entity);
      }),
    );
    return { items: saved };
  }
}
