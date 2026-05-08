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

export enum OpportunityStatus {
  DISPONIBLE = 'disponible',
  EN_EVALUACION = 'en_evaluacion',
  FINALIZADO = 'finalizado',
  DESIERTA = 'desierta',
  BLOQUEADA = 'bloqueada',
}

export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatus, string> = {
  [OpportunityStatus.DISPONIBLE]: 'Disponible',
  [OpportunityStatus.EN_EVALUACION]: 'En evaluación',
  [OpportunityStatus.FINALIZADO]: 'Finalizado',
  [OpportunityStatus.DESIERTA]: 'Desierta',
  [OpportunityStatus.BLOQUEADA]: 'En revisión',
};

export type FormFieldType = 'text_short' | 'text_long' | 'select_single' | 'select_multiple' | 'number' | 'date';

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  options?: string[];
  required: boolean;
}

export const FORM_FIELD_TYPE_LABELS: Record<FormFieldType, string> = {
  text_short: 'Texto corto',
  text_long: 'Texto largo',
  select_single: 'Selección única',
  select_multiple: 'Selección múltiple',
  number: 'Número',
  date: 'Fecha',
};

export const ALLOWED_TYPES_BY_ROLE: Record<string, OpportunityType[]> = {
  estudiante: [OpportunityType.AYUDANTIA, OpportunityType.GRUPO_ESTUDIO, OpportunityType.TUTORIA],
  docente: [OpportunityType.TUTORIA, OpportunityType.INVESTIGACION],
  institucion: [OpportunityType.PRACTICA, OpportunityType.VOLUNTARIADO, OpportunityType.TRABAJO],
};

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: OpportunityType;
  requirements?: string;
  deadline?: string;
  status: OpportunityStatus;
  publisher?: { id: string; name: string };
  formFields?: FormField[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOpportunityPayload {
  title: string;
  description: string;
  type: OpportunityType;
  requirements?: string;
  deadline?: string;
  formFields?: FormField[] | null;
}

export type UpdateOpportunityPayload = Partial<CreateOpportunityPayload>;
