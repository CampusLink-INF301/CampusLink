import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum NotificationType {
  OPPORTUNITY_MODIFIED = 'opportunity_modified',
  OPPORTUNITY_DELETED = 'opportunity_deleted',
  APPLICATION_RESULT = 'application_result',
  APPLICATION_FEEDBACK = 'application_feedback',
  APPLICATION_SUBMITTED = 'application_submitted',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column('text')
  message: string;

  @Column({ default: false })
  read: boolean;

  @Column({ nullable: true })
  relatedId: string;

  @CreateDateColumn()
  createdAt: Date;
}
