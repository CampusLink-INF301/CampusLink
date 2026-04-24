import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum OpportunityType {
  TUTORIA = 'tutoria',
  GRUPO_ESTUDIO = 'grupo_estudio',
  AYUDANTIA = 'ayudantia',
  TRABAJO = 'trabajo',
  PRACTICA = 'practica',
  VOLUNTARIADO = 'voluntariado',
  INVESTIGACION = 'investigacion',
  OTRO = 'otro',
}

@Entity('opportunities')
export class Opportunity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: OpportunityType, default: OpportunityType.OTRO })
  type: OpportunityType;

  @Column({ nullable: true })
  requirements: string;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, { nullable: true, eager: false })
  publisher: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
