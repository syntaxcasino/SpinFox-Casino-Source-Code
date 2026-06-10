// settings/setting.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  keyName: string;

  @Column('text')
  value: string;

  @Column({ type: 'enum', enum: ['site','limits','preferences','games'], default: 'site' })
  category: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
