import client from './client';
import type { Opportunity, CreateOpportunityPayload, UpdateOpportunityPayload } from '../types/opportunity';
import type { OpportunityType } from '../types/opportunity';

export interface OpportunityQuery {
  search?: string;
  type?: OpportunityType;
}

export const opportunitiesApi = {
  getAll: (params?: OpportunityQuery) =>
    client.get<Opportunity[]>('/opportunities', { params }).then((r) => r.data),

  getById: (id: string) =>
    client.get<Opportunity>(`/opportunities/${id}`).then((r) => r.data),

  create: (payload: CreateOpportunityPayload) =>
    client.post<Opportunity>('/opportunities', payload).then((r) => r.data),

  update: (id: string, payload: UpdateOpportunityPayload) =>
    client.put<Opportunity>(`/opportunities/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    client.delete(`/opportunities/${id}`),
};
