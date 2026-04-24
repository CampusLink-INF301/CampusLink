import { request } from '@playwright/test';

const API_URL = process.env.API_URL ?? 'http://localhost:3000/api';

export async function createTestOpportunity(data?: Partial<{
  title: string; description: string; type: string;
}>) {
  const ctx = await request.newContext();
  const res = await ctx.post(`${API_URL}/opportunities`, {
    data: {
      title: data?.title ?? 'Oportunidad de Prueba',
      description: data?.description ?? 'Descripción de prueba para tests automatizados.',
      type: data?.type ?? 'tutoria',
    },
  });
  await ctx.dispose();
  return res.json() as Promise<{ id: string; title: string }>;
}

export async function deleteOpportunity(id: string) {
  const ctx = await request.newContext();
  await ctx.delete(`${API_URL}/opportunities/${id}`);
  await ctx.dispose();
}
