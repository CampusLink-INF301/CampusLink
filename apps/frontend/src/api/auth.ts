import client from './client';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; password: string; role?: string; }
export interface AuthResponse { token: string; user: { id: string; name: string; email: string; role: string; }; }

export const authApi = {
  login: (payload: LoginPayload) =>
    client.post<AuthResponse>('/auth/login', payload).then((r) => r.data),
  register: (payload: RegisterPayload) =>
    client.post<AuthResponse>('/auth/register', payload).then((r) => r.data),
  getMe: () =>
    client.get<AuthResponse['user']>('/auth/me').then((r) => r.data),
};
