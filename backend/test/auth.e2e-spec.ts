import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { bootstrapE2eApp } from './bootstrap-e2e-app';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../src/common/auth/auth-cookie';

describe('Auth (e2e)', () => {
  let app: Awaited<ReturnType<typeof bootstrapE2eApp>>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await bootstrapE2eApp(moduleFixture);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('creates a new user and sets auth cookies', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'newuser@hoblog.com', name: 'New User', password: 'password123' })
        .expect(201);

      expect(res.body).toEqual({});
      const raw = res.headers['set-cookie'];
      const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];
      expect(cookies.some((c: string) => c.startsWith(`${ACCESS_TOKEN_COOKIE}=`))).toBe(true);
      expect(cookies.some((c: string) => c.startsWith(`${REFRESH_TOKEN_COOKIE}=`))).toBe(true);
    });

    it('returns 409 when email is already registered', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'admin@hoblog.com', name: 'Dup', password: 'password123' })
        .expect(409);
    });

    it('returns 400 when email format is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email', name: 'Test', password: 'password123' })
        .expect(400);
    });

    it('returns 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'missing@hoblog.com' })
        .expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('issues new auth cookies using the refresh token cookie', async () => {
      const agent = request.agent(app.getHttpServer());
      await agent
        .post('/auth/login')
        .send({ email: 'admin@hoblog.com', password: 'password123' })
        .expect(200);

      const res = await agent.post('/auth/refresh').send({}).expect(200);

      expect(res.body).toEqual({});
      const raw = res.headers['set-cookie'];
      const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];
      expect(cookies.some((c: string) => c.startsWith(`${ACCESS_TOKEN_COOKIE}=`))).toBe(true);
      expect(cookies.some((c: string) => c.startsWith(`${REFRESH_TOKEN_COOKIE}=`))).toBe(true);
    });

    it('returns 401 when no refresh token is provided', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').send({}).expect(401);
    });

    it('returns 401 when refresh token is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .set('Cookie', `${REFRESH_TOKEN_COOKIE}=invalid.token`)
        .expect(401);
    });
  });

  describe('POST /auth/login', () => {
    it('sets httpOnly auth cookies when credentials are valid', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@hoblog.com', password: 'password123' })
        .expect(200);

      expect(res.body).toEqual({});
      const raw = res.headers['set-cookie'];
      const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];
      expect(cookies.length).toBeGreaterThan(0);
      expect(cookies.some((c: string) => c.startsWith(`${ACCESS_TOKEN_COOKIE}=`))).toBe(true);
      expect(cookies.some((c: string) => c.startsWith(`${REFRESH_TOKEN_COOKIE}=`))).toBe(true);
      expect(cookies.every((c: string) => c.toLowerCase().includes('httponly'))).toBe(true);
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
    it('returns 204 when logged out with valid session cookie', async () => {
      const agent = request.agent(app.getHttpServer());
      await agent
        .post('/auth/login')
        .send({ email: 'admin@hoblog.com', password: 'password123' })
        .expect(200);
      await agent.post('/auth/logout').expect(204);
    });

    it('returns 401 when no token is provided', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });

    it('returns 401 when token is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', `${ACCESS_TOKEN_COOKIE}=invalid.token.here`)
        .expect(401);
    });

    it('invalidates the refresh token after logout', async () => {
      const agent = request.agent(app.getHttpServer());
      await agent
        .post('/auth/login')
        .send({ email: 'admin@hoblog.com', password: 'password123' })
        .expect(200);
      await agent.post('/auth/logout').expect(204);
      await agent.post('/auth/refresh').send({}).expect(401);
    });
  });
});
