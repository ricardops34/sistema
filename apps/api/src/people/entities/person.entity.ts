import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('person')
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'internal_code', length: 50 })
  internalCode: string;

  @Column({ name: 'name_legal', length: 255 })
  nameLegal: string;

  @Column({ name: 'name_social', nullable: true, length: 255 })
  nameSocial: string;

  @Column({ name: 'birth_date', nullable: true, type: 'date' })
  birthDate: string;

  @Column({ nullable: true, length: 20 })
  gender: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
