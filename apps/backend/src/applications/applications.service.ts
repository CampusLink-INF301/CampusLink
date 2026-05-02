import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { Opportunity } from '../opportunities/entities/opportunity.entity';
import { User } from '../auth/entities/user.entity';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly repo: Repository<Application>,
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,
  ) {}

  async apply(userId: string, dto: CreateApplicationDto): Promise<Application> {
    const opportunity = await this.opportunityRepo.findOneBy({ id: dto.opportunityId });
    if (!opportunity) throw new NotFoundException(`Opportunity ${dto.opportunityId} not found`);

    const existing = await this.repo.findOne({
      where: { user: { id: userId }, opportunity: { id: dto.opportunityId } },
    });
    if (existing) throw new ConflictException('Ya has postulado a esta oportunidad');

    const application = this.repo.create({
      user: { id: userId } as User,
      opportunity: { id: dto.opportunityId } as Opportunity,
    });
    return this.repo.save(application);
  }

  findByUser(userId: string): Promise<Application[]> {
    return this.repo.find({
      where: { user: { id: userId } },
      relations: ['opportunity'],
      order: { createdAt: 'DESC' },
    });
  }
}
