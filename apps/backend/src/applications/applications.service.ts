import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { Application, ApplicationStatus } from './entities/application.entity';
import { Message } from './entities/message.entity';
import {
  Opportunity,
  OpportunityStatus,
} from '../opportunities/entities/opportunity.entity';
import { User } from '../auth/entities/user.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { FinalizeOpportunityDto } from './dto/finalize-opportunity.dto';
import { FeedbackDto } from './dto/feedback.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { normalizeSearch } from '../common/util/text';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly repo: Repository<Application>,
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
  ) {}

  async apply(userId: string, dto: CreateApplicationDto): Promise<Application> {
    const opportunity = await this.opportunityRepo.findOne({
      where: { id: dto.opportunityId },
      relations: ['publisher'],
    });
    if (!opportunity)
      throw new NotFoundException(`Opportunity ${dto.opportunityId} not found`);

    if (opportunity.publisher?.id === userId) {
      throw new BadRequestException('No puedes postular a tu propia oportunidad');
    }

    if (opportunity.status !== OpportunityStatus.DISPONIBLE) {
      throw new BadRequestException(
        'Esta oportunidad no está disponible para postular',
      );
    }

    const deadline = opportunity.deadline;
    if (deadline && new Date(deadline) < new Date()) {
      throw new BadRequestException('La fecha límite de postulación ha pasado');
    }

    const existing = await this.repo.findOne({
      where: { user: { id: userId }, opportunity: { id: dto.opportunityId } },
    });

    if (existing) {
      if (existing.status === ApplicationStatus.CANCELADO) {
        existing.status = ApplicationStatus.POSTULADO;
        existing.formResponses = dto.formResponses ?? null;
        const saved = await this.repo.save(existing);
        if (opportunity.publisher) {
          await this.notificationsService.create(
            opportunity.publisher.id,
            NotificationType.APPLICATION_SUBMITTED,
            `Nuevo postulante en "${opportunity.title}".`,
            opportunity.id,
          );
        }
        return saved;
      }
      throw new ConflictException('Ya has postulado a esta oportunidad');
    }

    try {
      const application = this.repo.create({
        user: { id: userId } as User,
        opportunity: { id: dto.opportunityId } as Opportunity,
        formResponses: dto.formResponses ?? null,
      });
      const saved = await this.repo.save(application);
      if (opportunity.publisher) {
        await this.notificationsService.create(
          opportunity.publisher.id,
          NotificationType.APPLICATION_SUBMITTED,
          `Nuevo postulante en "${opportunity.title}".`,
          opportunity.id,
        );
      }
      return saved;
    } catch (err) {
      if (
        err instanceof QueryFailedError &&
        (err as unknown as { code?: string }).code === '23505'
      ) {
        throw new ConflictException('Ya has postulado a esta oportunidad');
      }
      throw err;
    }
  }

  async cancel(userId: string, applicationId: string): Promise<void> {
    const application = await this.repo.findOne({
      where: { id: applicationId },
      relations: ['user', 'opportunity'],
    });
    if (!application)
      throw new NotFoundException(`Application ${applicationId} not found`);
    if (application.user.id !== userId)
      throw new ForbiddenException('No tienes permiso');

    if (application.status !== ApplicationStatus.POSTULADO) {
      throw new BadRequestException(
        'Solo se pueden cancelar postulaciones en estado Postulado',
      );
    }

    const deadline = application.opportunity.deadline;
    if (deadline && new Date(deadline) < new Date()) {
      throw new BadRequestException(
        'No se puede cancelar: la fecha límite ha pasado',
      );
    }

    application.status = ApplicationStatus.CANCELADO;
    await this.repo.save(application);
  }

  async findByOpportunity(
    opportunityId: string,
    requesterId: string,
  ): Promise<Application[]> {
    const opportunity = await this.opportunityRepo.findOne({
      where: { id: opportunityId },
      relations: ['publisher'],
    });
    if (!opportunity)
      throw new NotFoundException(`Opportunity ${opportunityId} not found`);
    if (opportunity.publisher?.id !== requesterId)
      throw new ForbiddenException('No tienes permiso');
    if (opportunity.status === OpportunityStatus.DISPONIBLE) {
      throw new BadRequestException(
        'La oportunidad debe haber cerrado antes de ver postulantes',
      );
    }

    return this.repo.find({
      where: { opportunity: { id: opportunityId } },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async finalize(
    opportunityId: string,
    requesterId: string,
    dto: FinalizeOpportunityDto,
  ): Promise<void> {
    const opportunity = await this.opportunityRepo.findOne({
      where: { id: opportunityId },
      relations: ['publisher'],
    });
    if (!opportunity)
      throw new NotFoundException(`Opportunity ${opportunityId} not found`);
    if (opportunity.publisher?.id !== requesterId)
      throw new ForbiddenException('No tienes permiso');
    if (opportunity.status !== OpportunityStatus.EN_EVALUACION) {
      throw new BadRequestException(
        'La oportunidad debe estar en evaluación para finalizarla',
      );
    }

    const applications = await this.repo.find({
      where: {
        opportunity: { id: opportunityId },
        status: ApplicationStatus.EN_EVALUACION,
      },
    });

    const appIds = applications.map((a) => a.id);
    for (const accId of dto.acceptedApplicationIds) {
      if (!appIds.includes(accId)) {
        throw new BadRequestException(
          `Postulación ${accId} no pertenece a esta oportunidad o no está en evaluación`,
        );
      }
    }

    const newOppStatus =
      dto.acceptedApplicationIds.length === 0
        ? OpportunityStatus.DESIERTA
        : OpportunityStatus.FINALIZADO;

    const applicationsWithUsers = await this.repo.find({
      where: {
        opportunity: { id: opportunityId },
        status: ApplicationStatus.EN_EVALUACION,
      },
      relations: ['user'],
    });

    await this.dataSource.transaction(async (manager) => {
      for (const app of applications) {
        const newStatus = dto.acceptedApplicationIds.includes(app.id)
          ? ApplicationStatus.ACEPTADO
          : ApplicationStatus.NO_SELECCIONADO;
        await manager.update(
          Application,
          { id: app.id },
          { status: newStatus },
        );
      }
      await manager.update(
        Opportunity,
        { id: opportunityId },
        { status: newOppStatus },
      );
    });

    // Notify applicants of their result
    for (const app of applicationsWithUsers) {
      const isAccepted = dto.acceptedApplicationIds.includes(app.id);
      await this.notificationsService.create(
        app.user.id,
        NotificationType.APPLICATION_RESULT,
        isAccepted
          ? `¡Fuiste aceptado en "${opportunity.title}"!`
          : `No fuiste seleccionado en "${opportunity.title}".`,
        opportunityId,
      );
    }
  }

  async setFeedback(
    applicationId: string,
    requesterId: string,
    dto: FeedbackDto,
  ): Promise<Application> {
    const application = await this.repo.findOne({
      where: { id: applicationId },
      relations: ['opportunity', 'opportunity.publisher', 'user'],
    });
    if (!application)
      throw new NotFoundException(`Application ${applicationId} not found`);
    if (application.opportunity.publisher?.id !== requesterId) {
      throw new ForbiddenException('No tienes permiso');
    }

    const { status } = application.opportunity;
    if (
      status !== OpportunityStatus.FINALIZADO &&
      status !== OpportunityStatus.DESIERTA
    ) {
      throw new BadRequestException(
        'Solo se puede dar feedback cuando la oportunidad está finalizada',
      );
    }

    application.feedback = dto.feedback;
    const saved = await this.repo.save(application);

    await this.notificationsService.create(
      application.user.id,
      NotificationType.APPLICATION_FEEDBACK,
      `Recibiste feedback en "${application.opportunity.title}".`,
      applicationId,
    );

    return saved;
  }

  async findByUser(
    userId: string,
    query?: QueryApplicationDto,
  ): Promise<Application[]> {
    if (!query || (!query.search && !query.type && !query.status)) {
      return this.repo.find({
        where: { user: { id: userId } },
        relations: ['opportunity'],
        order: { createdAt: 'DESC' },
      });
    }

    const qb = this.repo
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.opportunity', 'opportunity')
      .where('application.user_id = :userId', { userId })
      .orderBy('application.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('application.status = :status', { status: query.status });
    }
    if (query.type) {
      qb.andWhere('opportunity.type = :type', { type: query.type });
    }
    if (query.search) {
      const normalized = normalizeSearch(query.search);
      qb.andWhere('opportunity.searchText ILIKE :search', {
        search: `%${normalized}%`,
      });
    }

    return qb.getMany();
  }

  async getStats(userId: string): Promise<{
    total: number;
    aceptadas: number;
    pendientes: number;
    rechazadas: number;
  }> {
    const all = await this.repo.find({
      where: { user: { id: userId } },
      select: ['id', 'status'],
    });
    return {
      total: all.length,
      aceptadas: all.filter((a) => a.status === ApplicationStatus.ACEPTADO).length,
      pendientes: all.filter(
        (a) =>
          a.status === ApplicationStatus.POSTULADO ||
          a.status === ApplicationStatus.EN_EVALUACION,
      ).length,
      rechazadas: all.filter(
        (a) => a.status === ApplicationStatus.NO_SELECCIONADO,
      ).length,
    };
  }

  async findOne(userId: string, applicationId: string): Promise<Application> {
    const application = await this.repo.findOne({
      where: { id: applicationId },
      relations: ['user', 'opportunity', 'opportunity.publisher'],
    });
    if (!application) throw new NotFoundException('Application not found');

    const isApplicant = application.user.id === userId;
    const isPublisher = application.opportunity.publisher?.id === userId;
    if (!isApplicant && !isPublisher) throw new ForbiddenException('No tienes permiso');

    return application;
  }

  async getMessages(userId: string, applicationId: string): Promise<Message[]> {
    const application = await this.repo.findOne({
      where: { id: applicationId },
      relations: ['user', 'opportunity', 'opportunity.publisher'],
    });
    if (!application) throw new NotFoundException('Application not found');

    const isApplicant = application.user.id === userId;
    const isPublisher = application.opportunity.publisher?.id === userId;
    if (!isApplicant && !isPublisher) throw new ForbiddenException('No tienes permiso');

    if (application.status !== ApplicationStatus.ACEPTADO) {
      throw new BadRequestException(
        'El chat solo está disponible para postulaciones aceptadas',
      );
    }

    return this.messageRepo.find({
      where: { application: { id: applicationId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async sendMessage(
    userId: string,
    applicationId: string,
    dto: CreateMessageDto,
  ): Promise<Message> {
    const application = await this.repo.findOne({
      where: { id: applicationId },
      relations: ['user', 'opportunity', 'opportunity.publisher'],
    });
    if (!application) throw new NotFoundException('Application not found');

    const isApplicant = application.user.id === userId;
    const isPublisher = application.opportunity.publisher?.id === userId;
    if (!isApplicant && !isPublisher) throw new ForbiddenException('No tienes permiso');

    if (application.status !== ApplicationStatus.ACEPTADO) {
      throw new BadRequestException(
        'El chat solo está disponible para postulaciones aceptadas',
      );
    }

    const message = this.messageRepo.create({
      application: { id: applicationId } as Application,
      sender: { id: userId } as User,
      content: dto.content,
    });
    return this.messageRepo.save(message);
  }
}
