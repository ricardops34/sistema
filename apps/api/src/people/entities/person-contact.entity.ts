import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('person_contact')
export class PersonContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'person_id' })
  personId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ length: 30 })
  type: string;

  @Column({ length: 255 })
  value: string;

  @Column({ nullable: true, length: 100 })
  label: string;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
