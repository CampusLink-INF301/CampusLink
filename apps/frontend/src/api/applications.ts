import client from './client';
import type { Application } from '../types/application';

export const applicationsApi = {
  apply: (opportunityId: string) =>
    client.post<Application>('/applications', { opportunityId }).then((r) => r.data),
  getMine: () =>
    client.get<Application[]>('/applications/mine').then((r) => r.data),
};
