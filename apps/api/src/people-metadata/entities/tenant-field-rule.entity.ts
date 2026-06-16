import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tenant_field_rule')
export class TenantFieldRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'field_name', length: 100 })
  fieldName: string;

  @Column({ name: 'is_required', default: false })
  isRequired: boolean;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;

  @Column({ nullable: true, length: 100 })
  label: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
