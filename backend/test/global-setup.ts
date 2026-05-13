import * as dotenv from 'dotenv';
import * as path from 'path';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { seed } from '../prisma/seed';

export default async function globalSetup() {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });

  if (process.env.NODE_ENV === 'production') {
    throw new Error('E2E tests must not run in production.');
  }

  execSync('npx prisma db push --accept-data-loss', {
    env: { ...process.env },
    stdio: 'inherit',
  });

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "users", "categories", "activities", "tags", "activity_tags" RESTART IDENTITY CASCADE'
    );
    await seed(prisma);
  } finally {
    await prisma.$disconnect();
  }
}
