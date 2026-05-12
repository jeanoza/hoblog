import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateActivityUseCase } from './create-activity.usecase';
import { ListActivitiesUseCase } from './list-activities.usecase';
import { GetActivityUseCase } from './get-activity.usecase';
import { UpdateActivityUseCase } from './update-activity.usecase';
import { DeleteActivityUseCase } from './delete-activity.usecase';
import type { IActivityRepository } from '../domain/activity.repository.interface';
import { ActivityEntity } from '../domain/activity.entity';

const mockRepo: jest.Mocked<IActivityRepository> = {
  findById: jest.fn(),
  findAllByUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const makeActivity = (overrides: Partial<ConstructorParameters<typeof ActivityEntity>[0]> = {}) =>
  new ActivityEntity({
    id: 1,
    title: 'Morning Run',
    note: '5km',
    date: new Date('2024-06-01'),
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01'),
    userId: 1,
    categoryId: 1,
    ...overrides,
  });

beforeEach(() => jest.clearAllMocks());

describe('CreateActivityUseCase', () => {
  const useCase = new CreateActivityUseCase(mockRepo);

  it('creates and returns an activity', async () => {
    const activity = makeActivity();
    mockRepo.create.mockResolvedValue(activity);

    const result = await useCase.execute({
      title: 'Morning Run',
      date: new Date('2024-06-01'),
      categoryId: 1,
      userId: 1,
    });

    expect(result).toBe(activity);
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Morning Run', userId: 1 })
    );
  });
});

describe('ActivityEntity', () => {
  it('isDeleted returns false when deletedAt is null', () => {
    const activity = makeActivity({ deletedAt: null });
    expect(activity.isDeleted).toBe(false);
  });

  it('isDeleted returns true when deletedAt is set', () => {
    const activity = makeActivity({ deletedAt: new Date() });
    expect(activity.isDeleted).toBe(true);
  });
});

describe('ListActivitiesUseCase', () => {
  const useCase = new ListActivitiesUseCase(mockRepo);

  it('returns activities for the given user', async () => {
    const activities = [makeActivity(), makeActivity({ id: 2 })];
    mockRepo.findAllByUserId.mockResolvedValue(activities);

    const result = await useCase.execute(1);

    expect(result).toHaveLength(2);
    expect(mockRepo.findAllByUserId).toHaveBeenCalledWith(1, undefined);
  });
});

describe('GetActivityUseCase', () => {
  const useCase = new GetActivityUseCase(mockRepo);

  it('returns the activity when it belongs to the user', async () => {
    mockRepo.findById.mockResolvedValue(makeActivity());

    const result = await useCase.execute(1, 1);

    expect(result.id).toBe(1);
  });

  it('throws NotFoundException when activity does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(99, 1)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when activity belongs to another user', async () => {
    mockRepo.findById.mockResolvedValue(makeActivity({ userId: 2 }));

    await expect(useCase.execute(1, 1)).rejects.toThrow(ForbiddenException);
  });
});

describe('UpdateActivityUseCase', () => {
  const useCase = new UpdateActivityUseCase(mockRepo);

  it('updates and returns the activity', async () => {
    const updated = makeActivity({ title: 'Evening Run' });
    mockRepo.findById.mockResolvedValue(makeActivity());
    mockRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute(1, 1, { title: 'Evening Run' });

    expect(result.title).toBe('Evening Run');
  });

  it('throws NotFoundException when activity does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(99, 1, { title: 'x' })).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when activity belongs to another user', async () => {
    mockRepo.findById.mockResolvedValue(makeActivity({ userId: 2 }));

    await expect(useCase.execute(1, 1, { title: 'x' })).rejects.toThrow(ForbiddenException);
  });
});

describe('DeleteActivityUseCase', () => {
  const useCase = new DeleteActivityUseCase(mockRepo);

  it('deletes the activity', async () => {
    mockRepo.findById.mockResolvedValue(makeActivity());
    mockRepo.delete.mockResolvedValue(undefined);

    await expect(useCase.execute(1, 1)).resolves.toBeUndefined();
    expect(mockRepo.delete).toHaveBeenCalledWith(1);
  });

  it('throws NotFoundException when activity does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(99, 1)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when activity belongs to another user', async () => {
    mockRepo.findById.mockResolvedValue(makeActivity({ userId: 2 }));

    await expect(useCase.execute(1, 1)).rejects.toThrow(ForbiddenException);
  });
});
