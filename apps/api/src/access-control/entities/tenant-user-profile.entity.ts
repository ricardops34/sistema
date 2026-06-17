import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('tenant_user_profile')
export class TenantUserProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_user_id' })
  tenantUserId: string;

  @Column({ name: 'tenant_profile_id' })
  tenantProfileId: string;

  @Column({ name: 'granted_by_type', length: 30, default: 'platform' })
  grantedByType: string;

  @Column({ name: 'is_locked_by_platform', default: false })
  isLockedByPlatform: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
