// promotions/promotion.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ValueTransformer } from 'typeorm';

// Transformer to convert decimal strings to numbers
const decimalToNumber: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string) => parseFloat(value),
};

@Entity()
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  subtitle: string;

  @Column({ type: 'enum', enum: ['bonus','freespin','cashback','welcome','deposit'], default: 'bonus' })
  type: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true, transformer: decimalToNumber })
  value: number;

  @Column({ nullable: true })
  badge: string;

  @Column({ nullable: true })
  bonus: string;

  @Column({ nullable: true })
  spins: string;

  @Column({ nullable: true })
  buttonText: string;

  @Column({ nullable: true })
  ctaLabel: string;

  @Column({ nullable: true })
  imageSrc: string;

  @Column({ nullable: true })
  overlayImageSrc: string;

  @Column({ nullable: true })
  href: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  terms: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'date', nullable: true })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
