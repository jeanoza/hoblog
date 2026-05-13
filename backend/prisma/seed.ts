import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

export async function seed(prisma: PrismaClient) {
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hoblog.com' },
    update: {},
    create: {
      email: 'admin@hoblog.com',
      name: 'Admin',
      passwordHash,
    },
  });

  const defaultCategories = [
    'Running',
    'Reading',
    'Cooking',
    'Gaming',
    'Cycling',
    'Other',
  ];
  for (const name of defaultCategories) {
    await prisma.category.upsert({
      where: { userId_name: { userId: admin.id, name } },
      update: {},
      create: { name, userId: admin.id },
    });
  }

  const defaultTags = [
    'outdoor',
    'indoor',
    'morning',
    'evening',
    'solo',
    'social',
  ];
  for (const name of defaultTags) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    await seed(prisma);
    console.log('Seed completed.');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
