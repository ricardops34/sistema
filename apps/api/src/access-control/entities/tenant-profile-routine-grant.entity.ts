import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('tenant_profile_routine_grant')
export class TenantProfileRoutineGrantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_profile_id' })
  tenantProfileId: string;

  @Column({ name: 'app_routine_id' })
  appRoutineId: string;

  @Column({ name: 'is_allowed', default: true })
  isAllowed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
