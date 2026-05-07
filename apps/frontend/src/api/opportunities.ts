import client from './client';
import type { Opportunity, OpportunityType, OpportunityStatus, CreateOpportunityPayload, UpdateOpportunityPayload } from '../types/opportunity';

export interface OpportunityQuery {
  search?: string;
  type?: OpportunityType;
  limit?: number;
  offset?: number;
}

export interface PublisherHistoryQuery {
  search?: string;
  type?: OpportunityType;
  status?: OpportunityStatus;
  sortBy?: 'createdAt' | 'deadline' | 'status';
  sortDir?: 'ASC' | 'DESC';
  page?: number;
}

export const opportunitiesApi = {
  getAll: (params?: OpportunityQuery) =>
    client
      .get<{ items: Opportunity[]; total: number; hasMore: boolean }>('/opportunities', { params })
      .then((r) => r.data),

  getMine: (params?: PublisherHistoryQuery) =>
    client
      .get<{ items: Opportunity[]; total: number }>('/opportunities/mine', { params })
      .then((r) => r.data),

  getById: (id: string) =>
    client.get<Opportunity>(`/opportunities/${id}`).then((r) => r.data),

  create: (payload: CreateOpportunityPayload) =>
    client.post<Opportunity>('/opportunities', payload).then((r) => r.data),

  update: (id: string, payload: UpdateOpportunityPayload) =>
    client.put<Opportunity>(`/opportunities/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    client.delete(`/opportunities/${id}`),
};
