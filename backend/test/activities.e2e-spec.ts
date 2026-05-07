import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Activities (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let createdId: number;

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
    accessToken = (res.body as { accessToken: string }).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /activities', () => {
    it('creates an activity and returns it', async () => {
      const res = await request(app.getHttpServer())
        .post('/activities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Morning Run', date: '2024-06-01', categoryId: 1 })
        .expect(201);

      const body = res.body as { id: number; title: string };
      expect(body.id).toBeDefined();
      expect(body.title).toBe('Morning Run');
      createdId = body.id;
    });

    it('returns 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/activities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'No date' })
        .expect(400);
    });

    it('returns 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/activities')
        .send({ title: 'Morning Run', date: '2024-06-01', categoryId: 1 })
        .expect(401);
    });
  });

  describe('GET /activities', () => {
    it('returns a list of activities for the current user', async () => {
      const res = await request(app.getHttpServer())
        .get('/activities')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('returns 401 when not authenticated', async () => {
      await request(app.getHttpServer()).get('/activities').expect(401);
    });
  });

  describe('GET /activities/:id', () => {
    it('returns the activity by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/activities/${createdId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = res.body as { id: number };
      expect(body.id).toBe(createdId);
    });

    it('returns 404 when activity does not exist', async () => {
      await request(app.getHttpServer())
        .get('/activities/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('PATCH /activities/:id', () => {
    it('updates the activity', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/activities/${createdId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Evening Run' })
        .expect(200);

      const body = res.body as { title: string };
      expect(body.title).toBe('Evening Run');
    });

    it('returns 404 when activity does not exist', async () => {
      await request(app.getHttpServer())
        .patch('/activities/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'x' })
        .expect(404);
    });
  });

  describe('DELETE /activities/:id', () => {
    it('deletes the activity and returns 204', async () => {
      await request(app.getHttpServer())
        .delete(`/activities/${createdId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('returns 404 when activity does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/activities/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
