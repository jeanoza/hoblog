import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { bootstrapE2eApp, E2eReq } from './bootstrap-e2e-app';

describe('Health (e2e)', () => {
  let app: INestApplication;
  let req: E2eReq;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    ({ app, req } = await bootstrapE2eApp(moduleFixture));
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    return req.get('/health').expect(200).expect({ status: 'ok' });
  });
});
