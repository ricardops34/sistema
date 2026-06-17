import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('tenant_profile_action_grant')
export class TenantProfileActionGrantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_profile_id' })
  tenantProfileId: string;

  @Column({ name: 'app_routine_action_id' })
  appRoutineActionId: string;

  @Column({ name: 'is_allowed', default: true })
  isAllowed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
