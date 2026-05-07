import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreatePhotoUseCase } from './create-photo.usecase';
import { ListPhotosUseCase } from './list-photos.usecase';
import { DeletePhotoUseCase } from './delete-photo.usecase';
import type { IPhotoRepository } from '../domain/photo.repository.interface';
import type { IActivityRepository } from '../../activity/domain/activity.repository.interface';
import { PhotoEntity } from '../domain/photo.entity';
import { ActivityEntity } from '../../activity/domain/activity.entity';

const mockActivityRepo: jest.Mocked<IActivityRepository> = {
  findById: jest.fn(),
  findAllByUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockPhotoRepo: jest.Mocked<IPhotoRepository> = {
  findById: jest.fn(),
  findAllByActivityId: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

const mockStorageService = {
  getSignedUploadUrl: jest.fn(),
  getPublicUrl: jest.fn(),
  deleteFile: jest.fn(),
};

const activity = new ActivityEntity({
  id: 1,
  title: 'Run',
  date: new Date(),
  createdAt: new Date(),
  userId: 1,
  categoryId: 1,
});
const photo = new PhotoEntity({
  id: 1,
  url: 'https://storage.googleapis.com/bucket/photos/1/1/123.jpg',
  order: 0,
  createdAt: new Date(),
  activityId: 1,
});

describe('CreatePhotoUseCase', () => {
  let useCase: CreatePhotoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreatePhotoUseCase(mockActivityRepo, mockPhotoRepo);
  });

  it('creates a photo for owned activity', async () => {
    mockActivityRepo.findById.mockResolvedValue(activity);
    mockPhotoRepo.create.mockResolvedValue(photo);

    const result = await useCase.execute({ userId: 1, activityId: 1, url: photo.url });

    expect(result.url).toBe(photo.url);
    expect(mockPhotoRepo.create).toHaveBeenCalledWith({ url: photo.url, order: 0, activityId: 1 });
  });

  it('throws NotFoundException when activity does not exist', async () => {
    mockActivityRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ userId: 1, activityId: 99, url: 'url' })).rejects.toThrow(
      NotFoundException
    );
  });

  it('throws ForbiddenException when user does not own the activity', async () => {
    mockActivityRepo.findById.mockResolvedValue(activity);

    await expect(useCase.execute({ userId: 2, activityId: 1, url: 'url' })).rejects.toThrow(
      ForbiddenException
    );
  });
});

describe('ListPhotosUseCase', () => {
  let useCase: ListPhotosUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ListPhotosUseCase(mockActivityRepo, mockPhotoRepo);
  });

  it('returns photos for owned activity', async () => {
    mockActivityRepo.findById.mockResolvedValue(activity);
    mockPhotoRepo.findAllByActivityId.mockResolvedValue([photo]);

    const result = await useCase.execute(1, 1);

    expect(result).toHaveLength(1);
  });

  it('throws ForbiddenException for another user activity', async () => {
    mockActivityRepo.findById.mockResolvedValue(activity);

    await expect(useCase.execute(2, 1)).rejects.toThrow(ForbiddenException);
  });
});

describe('DeletePhotoUseCase', () => {
  let useCase: DeletePhotoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeletePhotoUseCase(mockActivityRepo, mockPhotoRepo, mockStorageService as never);
  });

  it('deletes photo and GCS file for owned activity', async () => {
    mockPhotoRepo.findById.mockResolvedValue(photo);
    mockActivityRepo.findById.mockResolvedValue(activity);
    mockStorageService.deleteFile.mockResolvedValue(undefined);
    mockPhotoRepo.delete.mockResolvedValue();

    await expect(useCase.execute(1, 1)).resolves.toBeUndefined();
    expect(mockStorageService.deleteFile).toHaveBeenCalledWith('photos/1/1/123.jpg');
    expect(mockPhotoRepo.delete).toHaveBeenCalledWith(1);
  });

  it('throws NotFoundException when photo does not exist', async () => {
    mockPhotoRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(1, 99)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when user does not own the photo', async () => {
    mockPhotoRepo.findById.mockResolvedValue(photo);
    mockActivityRepo.findById.mockResolvedValue(activity);

    await expect(useCase.execute(2, 1)).rejects.toThrow(ForbiddenException);
  });
});
