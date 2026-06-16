import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tenant_person_policy')
export class TenantPersonPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'require_document', default: false })
  requireDocument: boolean;

  @Column({ name: 'require_birth_date', default: false })
  requireBirthDate: boolean;

  @Column({ name: 'require_email', default: false })
  requireEmail: boolean;

  @Column({ name: 'duplicate_check_criteria', type: 'jsonb', default: ['name'] })
  duplicateCheckCriteria: string[];

  @Column({ name: 'duplicate_check_mode', default: 'alert', length: 20 })
  duplicateCheckMode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
