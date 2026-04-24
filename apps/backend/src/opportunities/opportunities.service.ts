import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Opportunity } from './entities/opportunity.entity';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { QueryOpportunityDto } from './dto/query-opportunity.dto';

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private readonly repo: Repository<Opportunity>,
  ) {}

  findAll(query: QueryOpportunityDto): Promise<Opportunity[]> {
    const where: Record<string, unknown> = { isActive: true };
    if (query.type) where.type = query.type;
    if (query.search) where.title = ILike(`%${query.search}%`);
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Opportunity> {
    const opportunity = await this.repo.findOneBy({ id });
    if (!opportunity) throw new NotFoundException(`Opportunity ${id} not found`);
    return opportunity;
  }

  create(dto: CreateOpportunityDto): Promise<Opportunity> {
    const opportunity = this.repo.create(dto);
    return this.repo.save(opportunity);
  }

  async update(id: string, dto: UpdateOpportunityDto): Promise<Opportunity> {
    const opportunity = await this.findOne(id);
    Object.assign(opportunity, dto);
    return this.repo.save(opportunity);
  }

  async remove(id: string): Promise<void> {
    const opportunity = await this.findOne(id);
    await this.repo.remove(opportunity);
  }
}
