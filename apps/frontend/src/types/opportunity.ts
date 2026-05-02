export enum OpportunityType {
  TUTORIA = 'tutoria',
  GRUPO_ESTUDIO = 'grupo_estudio',
  AYUDANTIA = 'ayudantia',
  TRABAJO = 'trabajo',
  PRACTICA = 'practica',
  VOLUNTARIADO = 'voluntariado',
  INVESTIGACION = 'investigacion',
  OTRO = 'otro',
}

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  [OpportunityType.TUTORIA]: 'Tutoría',
  [OpportunityType.GRUPO_ESTUDIO]: 'Grupo de Estudio',
  [OpportunityType.AYUDANTIA]: 'Ayudantía',
  [OpportunityType.TRABAJO]: 'Trabajo Part-time',
  [OpportunityType.PRACTICA]: 'Práctica',
  [OpportunityType.VOLUNTARIADO]: 'Voluntariado',
  [OpportunityType.INVESTIGACION]: 'Investigación',
  [OpportunityType.OTRO]: 'Otro',
};

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: OpportunityType;
  requirements?: string;
  deadline?: string;
  isActive: boolean;
  publisher?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateOpportunityPayload {
  title: string;
  description: string;
  type: OpportunityType;
  requirements?: string;
  deadline?: string;
}

export type UpdateOpportunityPayload = Partial<CreateOpportunityPayload>;
