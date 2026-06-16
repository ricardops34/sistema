import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditEvent } from './entities/audit-event.entity';

export interface AuditEventData {
  tenantId?: string;
  actorIdentityId?: string;
  tenantUserId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  payload?: Record<string, unknown>;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditEvent)
    private auditRepo: Repository<AuditEvent>,
  ) {}

  async log(data: AuditEventData): Promise<AuditEvent> {
    const event = this.auditRepo.create(data);
    return this.auditRepo.save(event);
  }
}
