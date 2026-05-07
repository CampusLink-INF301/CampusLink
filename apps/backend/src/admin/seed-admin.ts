/**
 * Standalone script to seed an admin user.
 * Run with: npx ts-node -r tsconfig-paths/register src/admin/seed-admin.ts
 * Requires env vars: DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../auth/entities/user.entity';

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD env vars are required.');
    process.exit(1);
  }

  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User],
    synchronize: false,
  });

  await ds.initialize();

  const userRepo = ds.getRepository(User);
  const existing = await userRepo.findOne({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    await ds.destroy();
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = userRepo.create({
    email,
    name: 'Admin',
    password: hashed,
    role: UserRole.ADMIN,
  });
  await userRepo.save(admin);
  console.log(`Admin user created: ${email}`);
  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
