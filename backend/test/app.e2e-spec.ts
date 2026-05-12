import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { bootstrapE2eApp } from './bootstrap-e2e-app';
import { Server } from 'http';

describe('Health (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await bootstrapE2eApp(moduleFixture);
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    return request(server).get('/health').expect(200).expect({ status: 'ok' });
  });
});
