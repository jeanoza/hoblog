import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { bootstrapE2eApp, E2eAgent, E2eReq } from './bootstrap-e2e-app';

describe('Activities (e2e)', () => {
  let app: INestApplication;
  let req: E2eReq;
  let agent: E2eAgent;
  let createdId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    ({ app, req, agent } = await bootstrapE2eApp(moduleFixture));
    await agent
      .post('/auth/login')
      .send({ email: 'admin@hoblog.com', password: 'password123' })
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /activities', () => {
    it('creates an activity and returns it', async () => {
      const res = await agent
        .post('/activities')
        .send({ title: 'Morning Run', date: '2024-06-01', categoryId: 1 })
        .expect(201);

      const body = res.body as { id: number; title: string };
      expect(body.id).toBeDefined();
      expect(body.title).toBe('Morning Run');
      createdId = body.id;
    });

    it('returns 400 when required fields are missing', async () => {
      await agent.post('/activities').send({ title: 'No date' }).expect(400);
    });

    it('returns 401 when not authenticated', async () => {
      await req
        .post('/activities')
        .send({ title: 'Morning Run', date: '2024-06-01', categoryId: 1 })
        .expect(401);
    });
  });

  describe('GET /activities', () => {
    it('returns a list of activities for the current user', async () => {
      const res = await agent.get('/activities').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('returns 401 when not authenticated', async () => {
      await req.get('/activities').expect(401);
    });
  });

  describe('GET /activities/:id', () => {
    it('returns the activity by id', async () => {
      const res = await agent.get(`/activities/${createdId}`).expect(200);

      const body = res.body as { id: number };
      expect(body.id).toBe(createdId);
    });

    it('returns 404 when activity does not exist', async () => {
      await agent.get('/activities/99999').expect(404);
    });
  });

  describe('PATCH /activities/:id', () => {
    it('updates the activity', async () => {
      const res = await agent
        .patch(`/activities/${createdId}`)
        .send({ title: 'Evening Run' })
        .expect(200);

      const body = res.body as { title: string };
      expect(body.title).toBe('Evening Run');
    });

    it('returns 404 when activity does not exist', async () => {
      await agent.patch('/activities/99999').send({ title: 'x' }).expect(404);
    });
  });

  describe('DELETE /activities/:id', () => {
    it('deletes the activity and returns 204', async () => {
      await agent.delete(`/activities/${createdId}`).expect(204);
    });

    it('returns 404 when activity does not exist', async () => {
      await agent.delete('/activities/99999').expect(404);
    });
  });
});
