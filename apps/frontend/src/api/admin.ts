import client from './client';
import type { Opportunity } from '../types/opportunity';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  suspended: boolean;
  createdAt: string;
}

export const adminApi = {
  getUsers: (params?: { page?: number; search?: string }) =>
    client
      .get<{ items: AdminUser[]; total: number }>('/admin/users', { params })
      .then((r) => r.data),

  suspendUser: (id: string, suspended: boolean) =>
    client
      .patch<AdminUser>(`/admin/users/${id}/suspend`, { suspended })
      .then((r) => r.data),

  getOpportunities: (params?: { page?: number; search?: string }) =>
    client
      .get<{ items: Opportunity[]; total: number }>('/admin/opportunities', { params })
      .then((r) => r.data),

  blockOpportunity: (id: string, blocked: boolean) =>
    client
      .patch<Opportunity>(`/admin/opportunities/${id}/block`, { blocked })
      .then((r) => r.data),
};
