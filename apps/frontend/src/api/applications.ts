import client from './client';
import type { Application } from '../types/application';
import type { OpportunityType } from '../types/opportunity';
import type { ApplicationStatus } from '../types/application';

export interface ApplicationQuery {
  search?: string;
  type?: OpportunityType;
  status?: ApplicationStatus;
}

export const applicationsApi = {
  apply: (opportunityId: string) =>
    client.post<Application>('/applications', { opportunityId }).then((r) => r.data),
  cancel: (id: string) =>
    client.delete(`/applications/${id}`).then((r) => r.data),
  getMine: (params?: ApplicationQuery) =>
    client.get<Application[]>('/applications/mine', { params }).then((r) => r.data),
  getByOpportunity: (opportunityId: string) =>
    client.get<Application[]>(`/applications/by-opportunity/${opportunityId}`).then((r) => r.data),
  finalize: (opportunityId: string, acceptedApplicationIds: string[]) =>
    client.post(`/applications/finalize/${opportunityId}`, { acceptedApplicationIds }),
  setFeedback: (applicationId: string, feedback: string) =>
    client.put<Application>(`/applications/${applicationId}/feedback`, { feedback }).then((r) => r.data),
};
