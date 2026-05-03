import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

export async function seed(prisma: PrismaClient) {
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@hoblog.com' },
    update: {},
    create: {
      email: 'admin@hoblog.com',
      name: 'Admin',
      passwordHash,
    },
  });

  await prisma.category.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Running' },
      { name: 'Reading' },
      { name: 'Cooking' },
      { name: 'Gaming' },
      { name: 'Cycling' },
    ],
  });
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
