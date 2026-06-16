import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('person_document')
export class PersonDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'person_id' })
  personId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'document_type_key', length: 100 })
  documentTypeKey: string;

  @Column({ length: 255 })
  value: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
