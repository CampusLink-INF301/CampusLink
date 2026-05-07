import { Repository } from 'typeorm';
import { Opportunity, OpportunityStatus } from './entities/opportunity.entity';
import {
  Application,
  ApplicationStatus,
} from '../applications/entities/application.entity';

export async function applyDeadlineTransitions(
  opps: Opportunity[],
  appRepo: Repository<Application>,
  oppRepo: Repository<Opportunity>,
): Promise<void> {
  const now = new Date();
  const toTransition = opps.filter(
    (o) =>
      o.status === OpportunityStatus.DISPONIBLE &&
      o.deadline &&
      new Date(o.deadline as unknown as string) < now,
  );

  for (const opp of toTransition) {
    opp.status = OpportunityStatus.EN_EVALUACION;
    await oppRepo.save(opp);
    await appRepo
      .createQueryBuilder()
      .update()
      .set({ status: ApplicationStatus.EN_EVALUACION })
      .where('opportunity_id = :id AND status = :status', {
        id: opp.id,
        status: ApplicationStatus.POSTULADO,
      })
      .execute();
  }
}
