import { ValidationPipe, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { Server } from 'net';
import request from 'supertest';

export type E2eReq = ReturnType<typeof request>;
export type E2eAgent = ReturnType<typeof request.agent>;

export interface E2eContext {
  app: INestApplication;
  req: E2eReq;
  agent: E2eAgent;
}

export async function bootstrapE2eApp(
  moduleFixture: TestingModule
): Promise<E2eContext> {
  const app = moduleFixture.createNestApplication();
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:20001',
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();

  const server = app.getHttpServer() as Server;

  return {
    app,
    req: request(server),
    agent: request.agent(server),
  };
}
