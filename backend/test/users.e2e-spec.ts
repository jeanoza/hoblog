import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@hoblog.com', password: 'password123' });
    const body = res.body as { accessToken: string };
    accessToken = body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users/me', () => {
    it('returns the current user profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = res.body as { id: number; email: string; name: string; createdAt: string };
      expect(body.id).toBeDefined();
      expect(body.email).toBe('admin@hoblog.com');
      expect(body.name).toBeDefined();
      expect(body.createdAt).toBeDefined();
    });

    it('does not expose sensitive fields', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).not.toHaveProperty('passwordHash');
      expect(res.body).not.toHaveProperty('refreshTokenHash');
    });

    it('returns 401 when no token is provided', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('returns 401 when token is invalid', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });

  describe('PATCH /users/me', () => {
    it('updates the user name', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      const body = res.body as { name: string; email: string };
      expect(body.name).toBe('Updated Name');
      expect(body.email).toBe('admin@hoblog.com');
    });

    it('does not expose sensitive fields after update', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Admin' })
        .expect(200);

      expect(res.body).not.toHaveProperty('passwordHash');
      expect(res.body).not.toHaveProperty('refreshTokenHash');
    });

    it('returns 401 when not authenticated', async () => {
      await request(app.getHttpServer()).patch('/users/me').send({ name: 'Hacker' }).expect(401);
    });
  });
});
