import type { Opportunity } from './opportunity';

export enum ApplicationStatus {
  POSTULADO = 'postulado',
  EN_EVALUACION = 'en_evaluacion',
  ACEPTADO = 'aceptado',
  NO_SELECCIONADO = 'no_seleccionado',
  CANCELADO = 'cancelado',
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.POSTULADO]: 'Postulado',
  [ApplicationStatus.EN_EVALUACION]: 'En evaluación',
  [ApplicationStatus.ACEPTADO]: 'Aceptado',
  [ApplicationStatus.NO_SELECCIONADO]: 'No seleccionado',
  [ApplicationStatus.CANCELADO]: 'Cancelado',
};

export interface Application {
  id: string;
  opportunity: Opportunity;
  user?: { id: string; name: string; email: string };
  status: ApplicationStatus;
  feedback?: string | null;
  createdAt: string;
}
