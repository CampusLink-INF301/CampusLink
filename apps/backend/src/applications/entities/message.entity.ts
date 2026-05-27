import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Application } from './application.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
