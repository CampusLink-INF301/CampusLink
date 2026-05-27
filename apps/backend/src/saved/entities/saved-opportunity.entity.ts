import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Opportunity } from '../../opportunities/entities/opportunity.entity';

@Entity()
@Unique(['user', 'opportunity'])
export class SavedOpportunity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Opportunity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'opportunity_id' })
  opportunity: Opportunity;

  @CreateDateColumn()
  createdAt: Date;
}
