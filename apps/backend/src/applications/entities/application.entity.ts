import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Opportunity } from '../../opportunities/entities/opportunity.entity';

export enum ApplicationStatus {
  POSTULADO = 'postulado',
  EN_REVISION = 'en_revision',
  ACEPTADO = 'aceptado',
  RECHAZADO = 'rechazado',
}

@Entity('applications')
@Unique(['user', 'opportunity'])
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToOne(() => Opportunity, { nullable: false })
  opportunity: Opportunity;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.POSTULADO })
  status: ApplicationStatus;

  @CreateDateColumn()
  createdAt: Date;
}
