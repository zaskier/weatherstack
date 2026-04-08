import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('property')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  city: string;

  @Column({ type: 'varchar' })
  street: string;

  @Index()
  @Column({ type: 'varchar' })
  state: string;

  @Column({ type: 'varchar' })
  zipCode: string;

  @Column({ type: 'jsonb', nullable: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  weather: any;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  long: number;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
