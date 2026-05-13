import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Server } from 'http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { bootstrapE2eApp } from './bootstrap-e2e-app';

describe('Tags (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let agent: ReturnType<typeof request.agent>;
  let activityId: number;
  let tagId: number;

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

    const res = await agent
      .post('/activities')
      .send({ title: 'Tag Test Activity', date: '2024-06-01', categoryId: 1 })
      .expect(201);
    activityId = (res.body as { id: number }).id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /tags/search', () => {
    it('returns matching tag names', async () => {
      const res = await agent.get('/tags/search?q=out').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const names = res.body as string[];
      expect(names.every((n) => typeof n === 'string')).toBe(true);
    });

    it('returns empty array for no matches', async () => {
      const res = await agent.get('/tags/search?q=zzznomatch').expect(200);

      expect(res.body).toEqual([]);
    });

    it('returns 401 when not authenticated', async () => {
      await request(server).get('/tags/search?q=run').expect(401);
    });
  });

  describe('POST /activities/:activityId/tags', () => {
    it('creates a global tag and links it to the activity', async () => {
      const res = await agent
        .post(`/activities/${activityId}/tags`)
        .send({ name: 'morning' })
        .expect(201);

      const body = res.body as { id: number; name: string };
      expect(body.name).toBe('morning');
      expect(body.id).toBeDefined();
      tagId = body.id;
    });

    it('is idempotent when adding the same tag twice', async () => {
      await agent
        .post(`/activities/${activityId}/tags`)
        .send({ name: 'morning' })
        .expect(201);
    });

    it('returns the same tag id when the global tag already exists', async () => {
      const first = await agent
        .post(`/activities/${activityId}/tags`)
        .send({ name: 'shared-tag' })
        .expect(201);

      const second = await agent
        .post(`/activities/${activityId}/tags`)
        .send({ name: 'shared-tag' })
        .expect(201);

      // prettier-ignore
      expect((first.body as { id: number }).id)
        .toBe((second.body as { id: number }).id);
    });

    it('returns 400 when name is empty', async () => {
      await agent
        .post(`/activities/${activityId}/tags`)
        .send({ name: '' })
        .expect(400);
    });

    it('returns 404 when activity does not exist', async () => {
      await agent
        .post('/activities/99999/tags')
        .send({ name: 'morning' })
        .expect(404);
    });

    it('returns 401 when not authenticated', async () => {
      await request(server)
        .post(`/activities/${activityId}/tags`)
        .send({ name: 'morning' })
        .expect(401);
    });
  });

  describe('GET /activities/:activityId/tags', () => {
    it('returns tags linked to the activity', async () => {
      const res = await agent.get(`/activities/${activityId}/tags`).expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect((res.body as unknown[]).length).toBeGreaterThan(0);
    });

    it('returns 404 when activity does not exist', async () => {
      await agent.get('/activities/99999/tags').expect(404);
    });

    it('returns 401 when not authenticated', async () => {
      await request(server).get(`/activities/${activityId}/tags`).expect(401);
    });
  });

  describe('DELETE /activities/:activityId/tags/:tagId', () => {
    it('unlinks the tag from the activity and returns 204', async () => {
      await agent.delete(`/activities/${activityId}/tags/${tagId}`).expect(204);
    });

    it('returns 404 when activity does not exist', async () => {
      await agent.delete(`/activities/99999/tags/${tagId}`).expect(404);
    });

    it('returns 401 when not authenticated', async () => {
      await request(server)
        .delete(`/activities/${activityId}/tags/${tagId}`)
        .expect(401);
    });
  });

  describe('DELETE /tags/:id', () => {
    it('deletes the tag and returns 204', async () => {
      const res = await agent
        .post(`/activities/${activityId}/tags`)
        .send({ name: 'to-delete' })
        .expect(201);
      const id = (res.body as { id: number }).id;

      await agent.delete(`/tags/${id}`).expect(204);
    });

    it('returns 404 when tag does not exist', async () => {
      await agent.delete('/tags/99999').expect(404);
    });

    it('returns 401 when not authenticated', async () => {
      await request(server).delete(`/tags/1`).expect(401);
    });
  });
});
