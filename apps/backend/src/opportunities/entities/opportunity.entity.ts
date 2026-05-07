import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { normalizeSearch } from '../../common/util/text';

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

export enum OpportunityStatus {
  DISPONIBLE = 'disponible',
  EN_EVALUACION = 'en_evaluacion',
  FINALIZADO = 'finalizado',
  DESIERTA = 'desierta',
  BLOQUEADA = 'bloqueada',
}

@Entity('opportunities')
export class Opportunity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: OpportunityType,
    default: OpportunityType.OTRO,
  })
  type: OpportunityType;

  @Column({ nullable: true })
  requirements: string;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column({
    type: 'enum',
    enum: OpportunityStatus,
    default: OpportunityStatus.DISPONIBLE,
  })
  status: OpportunityStatus;

  @Column({ type: 'text', default: '' })
  searchText: string;

  @Column({ type: 'jsonb', nullable: true })
  formFields: Array<{
    id: string;
    label: string;
    type:
      | 'text_short'
      | 'text_long'
      | 'select_single'
      | 'select_multiple'
      | 'number'
      | 'date';
    options?: string[];
    required: boolean;
  }> | null;

  @ManyToOne(() => User, { nullable: true, eager: false })
  publisher: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  computeSearchText() {
    this.searchText = normalizeSearch(
      `${this.title ?? ''} ${this.description ?? ''} ${this.requirements ?? ''}`,
    );
  }
}
