import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tenant_user_action_override')
export class TenantUserActionOverrideEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_user_id' })
  tenantUserId: string;

  @Column({ name: 'app_routine_action_id' })
  appRoutineActionId: string;

  @Column({ name: 'is_allowed' })
  isAllowed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
