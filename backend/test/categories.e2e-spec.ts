import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Server } from 'http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { bootstrapE2eApp } from './bootstrap-e2e-app';

describe('Categories (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await bootstrapE2eApp(moduleFixture);
    server = app.getHttpServer() as Server;
    agent = request.agent(server);
    await agent
      .post('/auth/login')
      .send({ email: 'admin@hoblog.com', password: 'password123' })
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /categories', () => {
    it('returns the current user categories', async () => {
      const res = await agent.get('/categories').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const body = res.body as { id: number; name: string; userId: number }[];
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('id');
        expect(body[0]).toHaveProperty('name');
        expect(body[0]).toHaveProperty('userId');
      }
    });

    it('returns 401 when not authenticated', async () => {
      await request(server).get('/categories').expect(401);
    });
  });

  describe('POST /categories', () => {
    it('creates a new category', async () => {
      const res = await agent
        .post('/categories')
        .send({ name: 'E2E Test Category' })
        .expect(201);

      const body = res.body as { id: number; name: string; userId: number };
      expect(body.name).toBe('E2E Test Category');
      expect(body.id).toBeDefined();
    });

    it('returns 409 when category name already exists for the user', async () => {
      await agent
        .post('/categories')
        .send({ name: 'E2E Test Category' })
        .expect(409);
    });

    it('returns 400 when name is empty', async () => {
      await agent.post('/categories').send({ name: '' }).expect(400);
    });

    it('returns 401 when not authenticated', async () => {
      await request(server)
        .post('/categories')
        .send({ name: 'Test' })
        .expect(401);
    });
  });

  describe('PATCH /categories/:id', () => {
    it('renames an owned category', async () => {
      const createRes = await agent
        .post('/categories')
        .send({ name: 'To Rename' })
        .expect(201);

      const created = createRes.body as { id: number };

      const res = await agent
        .patch(`/categories/${created.id}`)
        .send({ name: 'Renamed' })
        .expect(200);

      const body = res.body as { name: string };
      expect(body.name).toBe('Renamed');
    });

    it('returns 409 when new name already exists', async () => {
      const first = await agent
        .post('/categories')
        .send({ name: 'Conflict Source' })
        .expect(201);

      await agent
        .post('/categories')
        .send({ name: 'Conflict Target' })
        .expect(201);

      const { id } = first.body as { id: number };
      await agent
        .patch(`/categories/${id}`)
        .send({ name: 'Conflict Target' })
        .expect(409);
    });

    it('returns 404 when category does not exist', async () => {
      await agent
        .patch('/categories/999999')
        .send({ name: 'Ghost' })
        .expect(404);
    });

    it('returns 401 when not authenticated', async () => {
      await request(server)
        .patch('/categories/1')
        .send({ name: 'Test' })
        .expect(401);
    });
  });

  describe('DELETE /categories/:id', () => {
    it('deletes an owned category', async () => {
      const createRes = await agent
        .post('/categories')
        .send({ name: 'To Delete' })
        .expect(201);

      const created = createRes.body as { id: number };

      await agent.delete(`/categories/${created.id}`).expect(204);
    });

    it('returns 404 when category does not exist', async () => {
      await agent.delete('/categories/999999').expect(404);
    });

    it('returns 401 when not authenticated', async () => {
      await request(server).delete('/categories/1').expect(401);
    });
  });
});
