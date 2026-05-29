import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import {
  Opportunity,
  OpportunityStatus,
  OpportunityType,
} from './entities/opportunity.entity';
import {
  Application,
  ApplicationStatus,
} from '../applications/entities/application.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { QueryOpportunityDto } from './dto/query-opportunity.dto';
import { PublisherHistoryDto } from './dto/publisher-history.dto';
import { applyDeadlineTransitions } from './opportunities.transitions';
import { normalizeSearch } from '../common/util/text';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

const ALLOWED_TYPES_BY_ROLE: Record<UserRole, OpportunityType[]> = {
  [UserRole.ESTUDIANTE]: [
    OpportunityType.AYUDANTIA,
    OpportunityType.GRUPO_ESTUDIO,
    OpportunityType.TUTORIA,
  ],
  [UserRole.DOCENTE]: [OpportunityType.TUTORIA, OpportunityType.INVESTIGACION],
  [UserRole.INSTITUCION]: [
    OpportunityType.PRACTICA,
    OpportunityType.VOLUNTARIADO,
    OpportunityType.TRABAJO,
  ],
  [UserRole.ADMIN]: [],
};

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private readonly repo: Repository<Opportunity>,
    @InjectRepository(Application)
    private readonly appRepo: Repository<Application>,
    private readonly notificationsService: NotificationsService,
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
      .leftJoin('opportunity.publisher', 'publisher')
      .addSelect(['publisher.id', 'publisher.name', 'publisher.role'])
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

  async create(
    dto: CreateOpportunityDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Opportunity> {
    // F3.1-R3: deadline must be future
    if (dto.deadline && new Date(dto.deadline) <= new Date()) {
      throw new BadRequestException(
        'La fecha límite debe ser una fecha futura',
      );
    }
    // F3.3-R5: type restriction by publisher role
    const allowed = ALLOWED_TYPES_BY_ROLE[userRole] ?? [];
    if (allowed.length > 0 && !allowed.includes(dto.type)) {
      throw new BadRequestException(
        `Tu perfil no puede publicar oportunidades de tipo "${dto.type}"`,
      );
    }
    const opportunity = this.repo.create({
      ...dto,
      formFields: (dto.formFields as Opportunity['formFields']) ?? null,
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
    // F3.3-R6: cannot edit if has active applications
    const activeApps = await this.appRepo.count({
      where: {
        opportunity: { id },
        status: Not(ApplicationStatus.CANCELADO),
      },
    });
    if (activeApps > 0) {
      throw new BadRequestException(
        'No se puede editar una oportunidad con postulaciones activas',
      );
    }
    // F3.3-R7: cannot edit within 2 days of deadline
    if (opportunity.deadline) {
      const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
      if (new Date(opportunity.deadline).getTime() - Date.now() < twoDaysMs) {
        throw new BadRequestException(
          'No se puede editar una oportunidad a menos de 2 días de su fecha límite',
        );
      }
    }
    // F3.1-R3: new deadline must be future
    if (dto.deadline && new Date(dto.deadline) <= new Date()) {
      throw new BadRequestException(
        'La fecha límite debe ser una fecha futura',
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
    // F3.3-R8: notify applicants before deleting
    const apps = await this.appRepo.find({
      where: { opportunity: { id }, status: Not(ApplicationStatus.CANCELADO) },
      relations: ['user'],
    });
    if (apps.length > 0) {
      const userIds = apps.map((a) => a.user.id);
      await this.notificationsService.createMany(
        userIds,
        NotificationType.OPPORTUNITY_DELETED,
        `La oportunidad "${opportunity.title}" fue eliminada por el publicador.`,
        id,
      );
    }
    await this.repo.remove(opportunity);
  }

  async closeApplications(opportunityId: string, userId: string): Promise<void> {
    const opportunity = await this.repo.findOne({
      where: { id: opportunityId },
      relations: ['publisher'],
    });
    if (!opportunity)
      throw new NotFoundException(`Opportunity ${opportunityId} not found`);
    if (opportunity.publisher?.id !== userId)
      throw new ForbiddenException('No tienes permiso');
    if (opportunity.status !== OpportunityStatus.DISPONIBLE) {
      throw new BadRequestException(
        'Solo se pueden cerrar oportunidades en estado Disponible',
      );
    }

    opportunity.status = OpportunityStatus.EN_EVALUACION;
    await this.repo.save(opportunity);
    await this.appRepo.update(
      { opportunity: { id: opportunityId }, status: ApplicationStatus.POSTULADO },
      { status: ApplicationStatus.EN_EVALUACION },
    );
  }

  async clone(
    id: string,
    userId: string,
    _userRole: UserRole,
  ): Promise<Opportunity> {
    const original = await this.repo.findOne({
      where: { id },
      relations: ['publisher'],
    });
    if (!original) throw new NotFoundException(`Opportunity ${id} not found`);
    if (original.publisher?.id !== userId)
      throw new ForbiddenException(
        'No tienes permiso para copiar esta oportunidad',
      );
    const cloned = this.repo.create({
      title: `${original.title} (copia)`,
      description: original.description,
      type: original.type,
      requirements: original.requirements,
      formFields: original.formFields,
      publisher: { id: userId } as User,
    });
    return this.repo.save(cloned);
  }
}
