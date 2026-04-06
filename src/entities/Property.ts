import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('property')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  city: string;

  @Column()
  street: string;

  @Column()
  state: string;

  @Column()
  zipCode: string;

  @Column({ type: 'jsonb', nullable: true })
  weatherData: any;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  long: number;

  @CreateDateColumn()
  createdAt: Date;
}
