import client from './client';
import type { Opportunity } from '../types/opportunity';

export const savedApi = {
  getMine: () =>
    client.get<Opportunity[]>('/saved').then((r) => r.data),
  getIds: () =>
    client.get<string[]>('/saved/ids').then((r) => r.data),
  save: (opportunityId: string) =>
    client.post(`/saved/${opportunityId}`),
  unsave: (opportunityId: string) =>
    client.delete(`/saved/${opportunityId}`),
};
