import type { Opportunity } from './opportunity';

export enum ApplicationStatus {
  POSTULADO = 'postulado',
  EN_REVISION = 'en_revision',
  ACEPTADO = 'aceptado',
  RECHAZADO = 'rechazado',
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.POSTULADO]: 'Postulado',
  [ApplicationStatus.EN_REVISION]: 'En revisión',
  [ApplicationStatus.ACEPTADO]: 'Aceptado',
  [ApplicationStatus.RECHAZADO]: 'Rechazado',
};

export interface Application {
  id: string;
  opportunity: Opportunity;
  status: ApplicationStatus;
  createdAt: string;
}
