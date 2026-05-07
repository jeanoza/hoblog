import * as dotenv from 'dotenv';
import * as path from 'path';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { seed } from '../prisma/seed';

export default async function globalSetup() {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });

  execSync('npx prisma db push --accept-data-loss', {
    env: { ...process.env },
    stdio: 'inherit',
  });

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "User", "Category", "Activity" RESTART IDENTITY CASCADE'
    );
    await seed(prisma);
  } finally {
    await prisma.$disconnect();
  }
}
