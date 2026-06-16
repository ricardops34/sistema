import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('person_context_code')
export class PersonContextCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'person_id' })
  personId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'context_key', length: 100 })
  contextKey: string;

  @Column({ length: 255 })
  code: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
