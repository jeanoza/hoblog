import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { bootstrapE2eApp } from './bootstrap-e2e-app';
import { ACCESS_TOKEN_COOKIE } from '../src/common/auth/auth-cookie';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await bootstrapE2eApp(moduleFixture);
    agent = request.agent(app.getHttpServer());
    await agent.post('/auth/login').send({ email: 'admin@hoblog.com', password: 'password123' }).expect(200);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users/me', () => {
    it('returns the current user profile', async () => {
      const res = await agent.get('/users/me').expect(200);

      const body = res.body as { id: number; email: string; name: string; createdAt: string };
      expect(body.id).toBeDefined();
      expect(body.email).toBe('admin@hoblog.com');
      expect(body.name).toBeDefined();
      expect(body.createdAt).toBeDefined();
    });

    it('does not expose sensitive fields', async () => {
      const res = await agent.get('/users/me').expect(200);

      expect(res.body).not.toHaveProperty('passwordHash');
      expect(res.body).not.toHaveProperty('refreshTokenHash');
    });

    it('returns 401 when no token is provided', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('returns 401 when token is invalid', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Cookie', `${ACCESS_TOKEN_COOKIE}=invalid.token.here`)
        .expect(401);
    });
  });

  describe('PATCH /users/me', () => {
    it('updates the user name', async () => {
      const res = await agent.patch('/users/me').send({ name: 'Updated Name' }).expect(200);

      const body = res.body as { name: string; email: string };
      expect(body.name).toBe('Updated Name');
      expect(body.email).toBe('admin@hoblog.com');
    });

    it('does not expose sensitive fields after update', async () => {
      const res = await agent.patch('/users/me').send({ name: 'Admin' }).expect(200);

      expect(res.body).not.toHaveProperty('passwordHash');
      expect(res.body).not.toHaveProperty('refreshTokenHash');
    });

    it('returns 401 when not authenticated', async () => {
      await request(app.getHttpServer()).patch('/users/me').send({ name: 'Hacker' }).expect(401);
    });
  });
});
