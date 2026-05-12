import { ValidationPipe, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';

export async function bootstrapE2eApp(
  moduleFixture: TestingModule
): Promise<INestApplication> {
  const app = moduleFixture.createNestApplication();
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:20001',
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();
  return app;
}
