import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('app_routine_action')
export class AppRoutineActionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'routine_id' })
  routineId: string;

  @Column({ length: 100 })
  code: string;

  @Column({ length: 150 })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
