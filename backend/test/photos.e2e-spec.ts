import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Server } from 'http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { bootstrapE2eApp } from './bootstrap-e2e-app';
import { StorageService } from '../src/common/storage/storage.service';

const mockStorageService = {
  getSignedUploadUrl: jest
    .fn()
    .mockResolvedValue('https://mock-signed-upload.url'),
  getPublicUrl: jest
    .fn()
    .mockReturnValue(
      'https://storage.googleapis.com/bucket/photos/1/1/mock.jpg'
    ),
  getSignedReadUrl: jest.fn().mockResolvedValue('https://mock-signed-read.url'),
  deleteFile: jest.fn().mockResolvedValue(undefined),
};

describe('Photos (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let agent: ReturnType<typeof request.agent>;
  let activityId: number;
  let photoId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(StorageService)
      .useValue(mockStorageService)
      .compile();

    app = await bootstrapE2eApp(moduleFixture);
    server = app.getHttpServer() as Server;
    agent = request.agent(server);
    await agent
      .post('/auth/login')
      .send({ email: 'admin@hoblog.com', password: 'password123' })
      .expect(200);

    const res = await agent
      .post('/activities')
      .send({ title: 'Photo Test Activity', date: '2024-06-01', categoryId: 1 })
      .expect(201);
    activityId = (res.body as { id: number }).id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /activities/:activityId/photos/upload-url', () => {
    it('returns a signed upload URL and destination', async () => {
      const res = await agent
        .post(`/activities/${activityId}/photos/upload-url`)
        .send({ contentType: 'image/jpeg' })
        .expect(201);

      const body = res.body as {
        uploadUrl: string;
        destination: string;
        publicUrl: string;
      };
      expect(body.uploadUrl).toBe('https://mock-signed-upload.url');
      expect(body.destination).toBeDefined();
      expect(body.publicUrl).toBeDefined();
    });

    it('returns 400 when contentType is not a valid mime type', async () => {
      await agent
        .post(`/activities/${activityId}/photos/upload-url`)
        .send({ contentType: 'not-a-mime' })
        .expect(400);
    });

    it('returns 404 when activity does not exist', async () => {
      await agent
        .post('/activities/99999/photos/upload-url')
        .send({ contentType: 'image/jpeg' })
        .expect(404);
    });

    it('returns 401 when not authenticated', async () => {
      await request(server)
        .post(`/activities/${activityId}/photos/upload-url`)
        .send({ contentType: 'image/jpeg' })
        .expect(401);
    });
  });

  describe('POST /activities/:activityId/photos', () => {
    it('creates a photo record and returns it', async () => {
      const res = await agent
        .post(`/activities/${activityId}/photos`)
        .send({
          url: 'https://storage.googleapis.com/bucket/photos/1/1/mock.jpg',
          order: 0,
        })
        .expect(201);

      const body = res.body as { id: number; url: string; order: number };
      expect(body.id).toBeDefined();
      expect(body.url).toBeDefined();
      photoId = body.id;
    });

    it('returns 400 when url is missing', async () => {
      await agent
        .post(`/activities/${activityId}/photos`)
        .send({ order: 0 })
        .expect(400);
    });

    it('returns 404 when activity does not exist', async () => {
      await agent
        .post('/activities/99999/photos')
        .send({ url: 'https://storage.googleapis.com/bucket/photo.jpg' })
        .expect(404);
    });

    it('returns 401 when not authenticated', async () => {
      await request(server)
        .post(`/activities/${activityId}/photos`)
        .send({ url: 'https://storage.googleapis.com/bucket/photo.jpg' })
        .expect(401);
    });
  });

  describe('GET /activities/:activityId/photos', () => {
    it('returns photos for the activity', async () => {
      const res = await agent
        .get(`/activities/${activityId}/photos`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect((res.body as unknown[]).length).toBeGreaterThan(0);
    });

    it('returns 404 when activity does not exist', async () => {
      await agent.get('/activities/99999/photos').expect(404);
    });

    it('returns 401 when not authenticated', async () => {
      await request(server).get(`/activities/${activityId}/photos`).expect(401);
    });
  });

  describe('DELETE /activities/:activityId/photos/:photoId', () => {
    it('deletes the photo and returns 204', async () => {
      await agent
        .delete(`/activities/${activityId}/photos/${photoId}`)
        .expect(204);
      expect(mockStorageService.deleteFile).toHaveBeenCalled();
    });

    it('returns 404 when photo does not exist', async () => {
      await agent.delete(`/activities/${activityId}/photos/99999`).expect(404);
    });

    it('returns 401 when not authenticated', async () => {
      await request(server)
        .delete(`/activities/${activityId}/photos/${photoId}`)
        .expect(401);
    });
  });
});
