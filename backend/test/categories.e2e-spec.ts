import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Categories (e2e)', () => {
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

  describe('GET /categories', () => {
    it('returns the current user categories', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const body = res.body as { id: number; name: string; userId: number }[];
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('id');
        expect(body[0]).toHaveProperty('name');
        expect(body[0]).toHaveProperty('userId');
      }
    });

    it('returns 401 when not authenticated', async () => {
      await request(app.getHttpServer()).get('/categories').expect(401);
    });
  });

  describe('POST /categories', () => {
    it('creates a new category', async () => {
      const res = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'E2E Test Category' })
        .expect(201);

      const body = res.body as { id: number; name: string; userId: number };
      expect(body.name).toBe('E2E Test Category');
      expect(body.id).toBeDefined();
    });

    it('returns 409 when category name already exists for the user', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'E2E Test Category' })
        .expect(409);
    });

    it('returns 400 when name is empty', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: '' })
        .expect(400);
    });

    it('returns 401 when not authenticated', async () => {
      await request(app.getHttpServer()).post('/categories').send({ name: 'Test' }).expect(401);
    });
  });

  describe('PATCH /categories/:id', () => {
    it('renames an owned category', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'To Rename' })
        .expect(201);

      const created = createRes.body as { id: number };

      const res = await request(app.getHttpServer())
        .patch(`/categories/${created.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Renamed' })
        .expect(200);

      const body = res.body as { name: string };
      expect(body.name).toBe('Renamed');
    });

    it('returns 409 when new name already exists', async () => {
      const first = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Conflict Source' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Conflict Target' })
        .expect(201);

      const { id } = first.body as { id: number };
      await request(app.getHttpServer())
        .patch(`/categories/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Conflict Target' })
        .expect(409);
    });

    it('returns 404 when category does not exist', async () => {
      await request(app.getHttpServer())
        .patch('/categories/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Ghost' })
        .expect(404);
    });

    it('returns 401 when not authenticated', async () => {
      await request(app.getHttpServer()).patch('/categories/1').send({ name: 'Test' }).expect(401);
    });
  });

  describe('DELETE /categories/:id', () => {
    it('deletes an owned category', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'To Delete' })
        .expect(201);

      const created = createRes.body as { id: number };

      await request(app.getHttpServer())
        .delete(`/categories/${created.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('returns 404 when category does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/categories/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('returns 401 when not authenticated', async () => {
      await request(app.getHttpServer()).delete('/categories/1').expect(401);
    });
  });
});
