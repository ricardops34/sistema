import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('audit_event')
export class AuditEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', nullable: true })
  tenantId: string;

  @Column({ name: 'actor_identity_id', nullable: true })
  actorIdentityId: string;

  @Column({ name: 'tenant_user_id', nullable: true })
  tenantUserId: string;

  @Column({ length: 100 })
  action: string;

  @Column({ name: 'resource_type', nullable: true, length: 100 })
  resourceType: string;

  @Column({ name: 'resource_id', nullable: true, length: 255 })
  resourceId: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown>;

  @Column({ name: 'ip_address', nullable: true, length: 64 })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
