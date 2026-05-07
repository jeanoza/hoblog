import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let accessToken: string;
  let refreshToken: string;

  beforeEach(async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@hoblog.com', password: 'password123' });
    const body = res.body as { accessToken: string; refreshToken: string };
    accessToken = body.accessToken;
    refreshToken = body.refreshToken;
  });

  describe('POST /auth/login', () => {
    it('returns accessToken when credentials are valid', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@hoblog.com', password: 'password123' })
        .expect(200);

      const body = res.body as { accessToken: string };
      expect(body.accessToken).toBeDefined();
      expect(typeof body.accessToken).toBe('string');
    });

    it('returns 401 when password is wrong', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@hoblog.com', password: 'wrongpassword' })
        .expect(401);
    });

    it('returns 401 when email does not exist', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@hoblog.com', password: 'password123' })
        .expect(401);
    });

    it('returns 400 when email format is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', password: 'password123' })
        .expect(400);
    });

    it('returns 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@hoblog.com' })
        .expect(400);
    });
  });

  describe('POST /auth/logout', () => {
    it('returns 204 when logged out with valid token', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('returns 401 when no token is provided', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });

    it('returns 401 when token is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('invalidates the refresh token after logout', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      // prettier-ignore
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });
});
