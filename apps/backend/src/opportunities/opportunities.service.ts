import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity, OpportunityStatus } from './entities/opportunity.entity';
import { Application } from '../applications/entities/application.entity';
import { User } from '../auth/entities/user.entity';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { QueryOpportunityDto } from './dto/query-opportunity.dto';
import { PublisherHistoryDto } from './dto/publisher-history.dto';
import { applyDeadlineTransitions } from './opportunities.transitions';
import { normalizeSearch } from '../common/util/text';

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private readonly repo: Repository<Opportunity>,
    @InjectRepository(Application)
    private readonly appRepo: Repository<Application>,
  ) {}

  async findAvailable(
    query: QueryOpportunityDto,
  ): Promise<{ items: Opportunity[]; total: number; hasMore: boolean }> {
    const stale = await this.repo.find({
      where: { status: OpportunityStatus.DISPONIBLE },
    });
    await applyDeadlineTransitions(stale, this.appRepo, this.repo);

    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    const qb = this.repo
      .createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.publisher', 'publisher')
      .where('opportunity.status = :status', {
        status: OpportunityStatus.DISPONIBLE,
      });

    if (query.type) {
      qb.andWhere('opportunity.type = :type', { type: query.type });
    }
    if (query.search) {
      const normalized = normalizeSearch(query.search);
      qb.andWhere('opportunity.searchText ILIKE :search', {
        search: `%${normalized}%`,
      });
    }

    qb.orderBy('opportunity.createdAt', 'DESC')
      .addOrderBy('opportunity.id', 'DESC')
      .take(limit)
      .skip(offset);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, hasMore: offset + items.length < total };
  }

  async findOne(id: string): Promise<Opportunity> {
    const opportunity = await this.repo.findOne({
      where: { id },
      relations: ['publisher'],
    });
    if (!opportunity)
      throw new NotFoundException(`Opportunity ${id} not found`);
    await applyDeadlineTransitions([opportunity], this.appRepo, this.repo);
    return opportunity;
  }

  async findByPublisher(
    userId: string,
    dto: PublisherHistoryDto,
  ): Promise<{ items: Opportunity[]; total: number }> {
    const page = dto.page ?? 1;
    const take = 10;
    const skip = (page - 1) * take;

    const qb = this.repo
      .createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.publisher', 'publisher')
      .where('publisher.id = :userId', { userId });

    if (dto.search) {
      qb.andWhere('opportunity.title ILIKE :search', {
        search: `%${dto.search}%`,
      });
    }
    if (dto.type) {
      qb.andWhere('opportunity.type = :type', { type: dto.type });
    }
    if (dto.status) {
      qb.andWhere('opportunity.status = :status', { status: dto.status });
    }

    const sortBy = dto.sortBy ?? 'createdAt';
    const sortDir = dto.sortDir ?? 'DESC';
    qb.orderBy(`opportunity.${sortBy}`, sortDir).take(take).skip(skip);

    const [items, total] = await qb.getManyAndCount();
    await applyDeadlineTransitions(items, this.appRepo, this.repo);
    return { items, total };
  }

  create(dto: CreateOpportunityDto, userId: string): Promise<Opportunity> {
    const opportunity = this.repo.create({
      ...dto,
      publisher: { id: userId } as User,
    });
    return this.repo.save(opportunity);
  }

  async update(
    id: string,
    dto: UpdateOpportunityDto,
    userId: string,
  ): Promise<Opportunity> {
    const opportunity = await this.repo.findOne({
      where: { id },
      relations: ['publisher'],
    });
    if (!opportunity)
      throw new NotFoundException(`Opportunity ${id} not found`);
    if (opportunity.publisher && opportunity.publisher.id !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para editar esta oportunidad',
      );
    }
    Object.assign(opportunity, dto);
    return this.repo.save(opportunity);
  }

  async remove(id: string, userId: string): Promise<void> {
    const opportunity = await this.repo.findOne({
      where: { id },
      relations: ['publisher'],
    });
    if (!opportunity)
      throw new NotFoundException(`Opportunity ${id} not found`);
    if (opportunity.publisher && opportunity.publisher.id !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta oportunidad',
      );
    }
    await this.repo.remove(opportunity);
  }
}
