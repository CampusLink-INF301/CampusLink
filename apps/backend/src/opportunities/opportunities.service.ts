import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Opportunity } from './entities/opportunity.entity';
import { User } from '../auth/entities/user.entity';
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
    return this.repo.find({ where, order: { createdAt: 'DESC' }, relations: ['publisher'] });
  }

  async findOne(id: string): Promise<Opportunity> {
    const opportunity = await this.repo.findOne({ where: { id }, relations: ['publisher'] });
    if (!opportunity) throw new NotFoundException(`Opportunity ${id} not found`);
    return opportunity;
  }

  create(dto: CreateOpportunityDto, userId: string): Promise<Opportunity> {
    const opportunity = this.repo.create({ ...dto, publisher: { id: userId } as User });
    return this.repo.save(opportunity);
  }

  async update(id: string, dto: UpdateOpportunityDto, userId: string): Promise<Opportunity> {
    const opportunity = await this.findOne(id);
    if (opportunity.publisher && opportunity.publisher.id !== userId) {
      throw new ForbiddenException('No tienes permiso para editar esta oportunidad');
    }
    Object.assign(opportunity, dto);
    return this.repo.save(opportunity);
  }

  async remove(id: string, userId: string): Promise<void> {
    const opportunity = await this.findOne(id);
    if (opportunity.publisher && opportunity.publisher.id !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta oportunidad');
    }
    await this.repo.remove(opportunity);
  }
}
