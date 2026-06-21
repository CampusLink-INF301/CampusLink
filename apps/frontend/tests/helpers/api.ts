import { request } from '@playwright/test';

const API_URL = (process.env.API_URL ?? 'http://localhost:3000/api')
  .replace('localhost', '127.0.0.1');

export const TEST_USERS = {
  docente: {
    name: 'E2E Docente',
    email: `e2e-docente-${process.env.E2E_RUN_ID ?? 'local'}@test.com`,
    password: 'Test1234!',
    role: 'docente',
  },
  estudiante: {
    name: 'E2E Estudiante',
    email: `e2e-estudiante-${process.env.E2E_RUN_ID ?? 'local'}@test.com`,
    password: 'Test1234!',
    role: 'estudiante',
  },
} as const;

export type TestRole = keyof typeof TEST_USERS;

async function getToken(role: TestRole): Promise<string> {
  const user = TEST_USERS[role];
  const ctx = await request.newContext();
  const res = await ctx.post(`${API_URL}/auth/login`, {
    data: { email: user.email, password: user.password },
  });
  if (!res.ok()) {
    const text = await res.text();
    await ctx.dispose();
    throw new Error(`Login failed for ${user.email}: ${res.status()} ${text}`);
  }
  const body = await res.json();
  await ctx.dispose();
  return body.token;
}

export async function createTestOpportunity(
  role: TestRole,
  data?: Partial<{ title: string; description: string; type: string }>,
) {
  const token = await getToken(role);
  const ctx = await request.newContext();
  const res = await ctx.post(`${API_URL}/opportunities`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: data?.title ?? 'Oportunidad de Prueba',
      description: data?.description ?? 'Descripción de prueba para tests automatizados.',
      type: data?.type ?? 'tutoria',
    },
  });
  if (!res.ok()) {
    const text = await res.text();
    await ctx.dispose();
    throw new Error(`Create opportunity failed: ${res.status()} ${text}`);
  }
  const body = await res.json();
  await ctx.dispose();
  if (!body.id) {
    throw new Error(`Create opportunity returned no id: ${JSON.stringify(body)}`);
  }
  return body as { id: string; title: string };
}

export async function deleteOpportunity(role: TestRole, id: string) {
  const token = await getToken(role);
  const ctx = await request.newContext();
  await ctx.delete(`${API_URL}/opportunities/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await ctx.dispose();
}
