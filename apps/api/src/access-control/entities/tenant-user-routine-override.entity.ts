import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tenant_user_routine_override')
export class TenantUserRoutineOverrideEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_user_id' })
  tenantUserId: string;

  @Column({ name: 'app_routine_id' })
  appRoutineId: string;

  @Column({ name: 'is_allowed' })
  isAllowed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
