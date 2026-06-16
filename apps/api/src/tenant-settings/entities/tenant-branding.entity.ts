import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tenant_branding')
export class TenantBranding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'display_name', nullable: true, length: 200 })
  displayName: string;

  @Column({ name: 'logo_url', nullable: true, length: 500 })
  logoUrl: string;

  @Column({ name: 'primary_color', nullable: true, length: 20 })
  primaryColor: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
