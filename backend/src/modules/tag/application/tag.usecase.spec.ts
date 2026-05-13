import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SearchTagsUseCase } from './search-tags.usecase';
import { GetActivityTagsUseCase } from './get-activity-tags.usecase';
import { AddTagToActivityUseCase } from './add-tag-to-activity.usecase';
import { RemoveTagFromActivityUseCase } from './remove-tag-from-activity.usecase';
import { DeleteTagUseCase } from './delete-tag.usecase';
import type { ITagRepository } from '../domain/tag.repository.interface';
import type { IActivityRepository } from '../../activity/domain/activity.repository.interface';
import { TagEntity } from '../domain/tag.entity';
import { ActivityEntity } from '../../activity/domain/activity.entity';

const mockTagRepo: jest.Mocked<ITagRepository> = {
  findById: jest.fn(),
  findByName: jest.fn(),
  searchByName: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  findByActivityId: jest.fn(),
  link: jest.fn(),
  unlink: jest.fn(),
};

const mockActivityRepo: jest.Mocked<IActivityRepository> = {
  findById: jest.fn(),
  findAllByUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const makeTag = (
  overrides: Partial<ConstructorParameters<typeof TagEntity>[0]> = {}
) =>
  new TagEntity({
    id: 1,
    name: 'running',
    createdAt: new Date(),
    ...overrides,
  });

const makeActivity = (
  overrides: Partial<ConstructorParameters<typeof ActivityEntity>[0]> = {}
) =>
  new ActivityEntity({
    id: 1,
    title: 'Morning Run',
    note: null,
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 1,
    categoryId: 1,
    ...overrides,
  });

beforeEach(() => jest.clearAllMocks());

describe('SearchTagsUseCase', () => {
  const useCase = new SearchTagsUseCase(mockTagRepo);

  it('returns matching tag names', async () => {
    mockTagRepo.searchByName.mockResolvedValue(['running', 'run club']);

    const result = await useCase.execute('run');

    expect(result).toEqual(['running', 'run club']);
    expect(mockTagRepo.searchByName).toHaveBeenCalledWith('run', 10);
  });

  it('returns empty array for no matches', async () => {
    mockTagRepo.searchByName.mockResolvedValue([]);

    expect(await useCase.execute('xyz')).toEqual([]);
  });
});

describe('GetActivityTagsUseCase', () => {
  const useCase = new GetActivityTagsUseCase(mockTagRepo, mockActivityRepo);

  it('returns tags for the activity', async () => {
    mockActivityRepo.findById.mockResolvedValue(makeActivity());
    mockTagRepo.findByActivityId.mockResolvedValue([makeTag()]);

    const result = await useCase.execute(1, 1);

    expect(result).toHaveLength(1);
    expect(mockTagRepo.findByActivityId).toHaveBeenCalledWith(1);
  });

  it('throws NotFoundException when activity does not exist', async () => {
    mockActivityRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(99, 1)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when activity belongs to another user', async () => {
    mockActivityRepo.findById.mockResolvedValue(makeActivity({ userId: 2 }));

    await expect(useCase.execute(1, 1)).rejects.toThrow(ForbiddenException);
  });
});

describe('AddTagToActivityUseCase', () => {
  const useCase = new AddTagToActivityUseCase(mockTagRepo, mockActivityRepo);

  it('creates a new tag and links it to the activity', async () => {
    mockActivityRepo.findById.mockResolvedValue(makeActivity());
    mockTagRepo.findByName.mockResolvedValue(null);
    mockTagRepo.create.mockResolvedValue(makeTag());
    mockTagRepo.link.mockResolvedValue(undefined);

    const result = await useCase.execute(1, 1, 'running');

    expect(mockTagRepo.create).toHaveBeenCalledWith('running');
    expect(mockTagRepo.link).toHaveBeenCalledWith(1, 1);
    expect(result.name).toBe('running');
  });

  it('reuses existing global tag when name already exists', async () => {
    const existing = makeTag({ id: 5 });
    mockActivityRepo.findById.mockResolvedValue(makeActivity());
    mockTagRepo.findByName.mockResolvedValue(existing);
    mockTagRepo.link.mockResolvedValue(undefined);

    const result = await useCase.execute(1, 1, 'running');

    expect(mockTagRepo.create).not.toHaveBeenCalled();
    expect(mockTagRepo.link).toHaveBeenCalledWith(1, 5);
    expect(result.id).toBe(5);
  });

  it('succeeds silently when tag is already linked (idempotent)', async () => {
    mockActivityRepo.findById.mockResolvedValue(makeActivity());
    mockTagRepo.findByName.mockResolvedValue(makeTag());
    mockTagRepo.link.mockRejectedValue(new Error('duplicate'));

    await expect(useCase.execute(1, 1, 'running')).resolves.toBeDefined();
  });

  it('throws NotFoundException when activity does not exist', async () => {
    mockActivityRepo.findById.mockResolvedValue(null);

    // prettier-ignore
    await expect(useCase.execute(99, 1, 'running'))
      .rejects
      .toThrow(NotFoundException);
  });

  it('throws ForbiddenException when activity belongs to another user', async () => {
    mockActivityRepo.findById.mockResolvedValue(makeActivity({ userId: 2 }));

    // prettier-ignore
    await expect(useCase.execute(1, 1, 'running'))
      .rejects
      .toThrow(ForbiddenException);
  });
});

describe('RemoveTagFromActivityUseCase', () => {
  const useCase = new RemoveTagFromActivityUseCase(
    mockTagRepo,
    mockActivityRepo
  );

  it('unlinks the tag from the activity', async () => {
    mockActivityRepo.findById.mockResolvedValue(makeActivity());
    mockTagRepo.unlink.mockResolvedValue(undefined);

    await expect(useCase.execute(1, 1, 1)).resolves.toBeUndefined();
    expect(mockTagRepo.unlink).toHaveBeenCalledWith(1, 1);
  });

  it('throws NotFoundException when activity does not exist', async () => {
    mockActivityRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(99, 1, 1)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when activity belongs to another user', async () => {
    mockActivityRepo.findById.mockResolvedValue(makeActivity({ userId: 2 }));

    await expect(useCase.execute(1, 1, 1)).rejects.toThrow(ForbiddenException);
  });
});

describe('DeleteTagUseCase', () => {
  const useCase = new DeleteTagUseCase(mockTagRepo);

  it('deletes the tag', async () => {
    mockTagRepo.findById.mockResolvedValue(makeTag());
    mockTagRepo.delete.mockResolvedValue(undefined);

    await expect(useCase.execute(1)).resolves.toBeUndefined();
    expect(mockTagRepo.delete).toHaveBeenCalledWith(1);
  });

  it('throws NotFoundException when tag does not exist', async () => {
    mockTagRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(99)).rejects.toThrow(NotFoundException);
  });
});
