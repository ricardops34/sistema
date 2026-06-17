import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tenant_user')
export class TenantUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'platform_identity_id' })
  platformIdentityId: string;

  @Column({ name: 'person_id', nullable: true })
  personId: string | null;

  @Column({ name: 'role_id', nullable: true })
  roleId: string;

  @Column({ length: 50, default: 'backoffice' })
  channel: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
