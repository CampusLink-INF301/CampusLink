import { TEST_USERS } from './helpers/api';

const API = (process.env.API_URL ?? 'http://localhost:3000/api')
  .replace('localhost', '127.0.0.1');

async function seedUser(user: (typeof TEST_USERS)[keyof typeof TEST_USERS]) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (res.status === 409 || res.ok) return;
  throw new Error(`Seed failed for ${user.email}: ${res.status} ${await res.text()}`);
}

export default async function globalSetup() {
  for (const user of Object.values(TEST_USERS)) {
    await seedUser(user);
  }
}
