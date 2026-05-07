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
  EN_EVALUACION = 'en_evaluacion',
  ACEPTADO = 'aceptado',
  NO_SELECCIONADO = 'no_seleccionado',
  CANCELADO = 'cancelado',
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

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.POSTULADO,
  })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @Column({ type: 'jsonb', nullable: true })
  formResponses: Record<string, string | string[]> | null;

  @CreateDateColumn()
  createdAt: Date;
}
