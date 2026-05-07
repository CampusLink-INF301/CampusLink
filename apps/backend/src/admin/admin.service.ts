import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import {
  Opportunity,
  OpportunityStatus,
} from '../opportunities/entities/opportunity.entity';

const PAGE_SIZE = 10;

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,
  ) {}

  async findUsers(query: {
    page?: number;
    search?: string;
  }): Promise<{ items: User[]; total: number }> {
    const page = query.page ?? 1;
    const skip = (page - 1) * PAGE_SIZE;
    const where = query.search
      ? [
          { name: ILike(`%${query.search}%`) },
          { email: ILike(`%${query.search}%`) },
        ]
      : {};
    const [items, total] = await this.userRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: PAGE_SIZE,
      skip,
    });
    return { items, total };
  }

  async suspendUser(
    targetId: string,
    requesterId: string,
    suspended: boolean,
  ): Promise<User> {
    if (targetId === requesterId) {
      throw new BadRequestException('No puedes suspenderte a ti mismo');
    }
    const user = await this.userRepo.findOne({ where: { id: targetId } });
    if (!user) throw new NotFoundException(`User ${targetId} not found`);
    user.suspended = suspended;
    return this.userRepo.save(user);
  }

  async findOpportunities(query: {
    page?: number;
    search?: string;
  }): Promise<{ items: Opportunity[]; total: number }> {
    const page = query.page ?? 1;
    const skip = (page - 1) * PAGE_SIZE;
    const where = query.search ? { title: ILike(`%${query.search}%`) } : {};
    const [items, total] = await this.opportunityRepo.findAndCount({
      where,
      relations: ['publisher'],
      order: { createdAt: 'DESC' },
      take: PAGE_SIZE,
      skip,
    });
    return { items, total };
  }

  async blockOpportunity(id: string, blocked: boolean): Promise<Opportunity> {
    const opp = await this.opportunityRepo.findOne({ where: { id } });
    if (!opp) throw new NotFoundException(`Opportunity ${id} not found`);
    opp.status = blocked
      ? OpportunityStatus.BLOQUEADA
      : OpportunityStatus.DISPONIBLE;
    return this.opportunityRepo.save(opp);
  }
}
