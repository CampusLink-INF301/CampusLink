import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedOpportunity } from './entities/saved-opportunity.entity';
import { Opportunity } from '../opportunities/entities/opportunity.entity';

@Injectable()
export class SavedService {
  constructor(
    @InjectRepository(SavedOpportunity)
    private readonly repo: Repository<SavedOpportunity>,
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,
  ) {}

  async save(userId: string, opportunityId: string): Promise<void> {
    const opportunity = await this.opportunityRepo.findOneBy({
      id: opportunityId,
    });
    if (!opportunity) throw new NotFoundException('Opportunity not found');

    const existing = await this.repo.findOne({
      where: { user: { id: userId }, opportunity: { id: opportunityId } },
    });
    if (existing) return;

    await this.repo.save(
      this.repo.create({
        user: { id: userId },
        opportunity: { id: opportunityId },
      }),
    );
  }

  async unsave(userId: string, opportunityId: string): Promise<void> {
    const existing = await this.repo.findOne({
      where: { user: { id: userId }, opportunity: { id: opportunityId } },
    });
    if (existing) await this.repo.remove(existing);
  }

  async findMine(userId: string): Promise<Opportunity[]> {
    const saved = await this.repo.find({
      where: { user: { id: userId } },
      relations: ['opportunity', 'opportunity.publisher'],
      order: { createdAt: 'DESC' },
    });
    return saved.map((s) => s.opportunity);
  }

  async getSavedIds(userId: string): Promise<string[]> {
    const saved = await this.repo.find({
      where: { user: { id: userId } },
      relations: ['opportunity'],
    });
    return saved.map((s) => s.opportunity.id);
  }
}
