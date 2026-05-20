import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryUseCase } from './create-category.usecase';
import { ListCategoriesUseCase } from './list-categories.usecase';
import { RenameCategoryUseCase } from './rename-category.usecase';
import { DeleteCategoryUseCase } from './delete-category.usecase';
import type { ICategoryRepository } from '../domain/category.repository.interface';
import { CategoryEntity } from '../domain/category.entity';

const mockRepo: jest.Mocked<ICategoryRepository> = {
  findAllByUserId: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  countActiveActivities: jest.fn(),
  delete: jest.fn(),
};

describe('ListCategoriesUseCase', () => {
  let useCase: ListCategoriesUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ListCategoriesUseCase(mockRepo);
  });

  it('returns categories for the given user', async () => {
    const categories = [
      new CategoryEntity({ id: 1, name: 'Cycling', userId: 1 }),
      new CategoryEntity({ id: 2, name: 'Running', userId: 1 }),
    ];
    mockRepo.findAllByUserId.mockResolvedValue(categories);

    const result = await useCase.execute(1);

    expect(result).toHaveLength(2);
    expect(mockRepo.findAllByUserId).toHaveBeenCalledWith(1);
  });

  it('returns empty array when user has no categories', async () => {
    mockRepo.findAllByUserId.mockResolvedValue([]);

    const result = await useCase.execute(99);

    expect(result).toEqual([]);
  });
});

describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateCategoryUseCase(mockRepo);
  });

  it('creates and returns a new category', async () => {
    const entity = new CategoryEntity({ id: 1, name: 'Running', userId: 1 });
    mockRepo.create.mockResolvedValue(entity);

    const result = await useCase.execute(1, 'Running');

    expect(result.name).toBe('Running');
    expect(result.userId).toBe(1);
    expect(mockRepo.create).toHaveBeenCalledWith({
      name: 'Running',
      userId: 1,
    });
  });

  it('throws ConflictException on duplicate name', async () => {
    mockRepo.create.mockRejectedValue(new Error('Unique constraint'));

    await expect(useCase.execute(1, 'Running')).rejects.toThrow(
      ConflictException
    );
  });
});

describe('RenameCategoryUseCase', () => {
  let useCase: RenameCategoryUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RenameCategoryUseCase(mockRepo);
  });

  it('renames the category when user owns it', async () => {
    const existing = new CategoryEntity({ id: 1, name: 'Running', userId: 1 });
    const renamed = new CategoryEntity({ id: 1, name: 'Jogging', userId: 1 });
    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.update.mockResolvedValue(renamed);

    const result = await useCase.execute(1, 1, 'Jogging');

    expect(result.name).toBe('Jogging');
    expect(mockRepo.update).toHaveBeenCalledWith(1, 'Jogging');
  });

  it('throws NotFoundException when category does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(1, 99, 'Jogging')).rejects.toThrow(
      NotFoundException
    );
  });

  it('throws ForbiddenException when user does not own the category', async () => {
    const existing = new CategoryEntity({ id: 1, name: 'Running', userId: 2 });
    mockRepo.findById.mockResolvedValue(existing);

    await expect(useCase.execute(1, 1, 'Jogging')).rejects.toThrow(
      ForbiddenException
    );
  });

  it('throws ConflictException on duplicate name', async () => {
    const existing = new CategoryEntity({ id: 1, name: 'Running', userId: 1 });
    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.update.mockRejectedValue(new Error('Unique constraint'));

    await expect(useCase.execute(1, 1, 'Cycling')).rejects.toThrow(
      ConflictException
    );
  });
});

describe('DeleteCategoryUseCase', () => {
  let useCase: DeleteCategoryUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteCategoryUseCase(mockRepo);
  });

  it('deletes the category when user owns it and no active activities', async () => {
    const entity = new CategoryEntity({ id: 1, name: 'Running', userId: 1 });
    mockRepo.findById.mockResolvedValue(entity);
    mockRepo.countActiveActivities.mockResolvedValue(0);
    mockRepo.delete.mockResolvedValue();

    await expect(useCase.execute(1, 1)).resolves.toBeUndefined();
    expect(mockRepo.countActiveActivities).toHaveBeenCalledWith(1);
    expect(mockRepo.delete).toHaveBeenCalledWith(1);
  });

  it('throws ConflictException when category has active activities', async () => {
    const entity = new CategoryEntity({ id: 1, name: 'Running', userId: 1 });
    mockRepo.findById.mockResolvedValue(entity);
    mockRepo.countActiveActivities.mockResolvedValue(2);

    await expect(useCase.execute(1, 1)).rejects.toThrow(ConflictException);
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when category does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(1, 99)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when user does not own the category', async () => {
    const entity = new CategoryEntity({ id: 1, name: 'Running', userId: 2 });
    mockRepo.findById.mockResolvedValue(entity);

    await expect(useCase.execute(1, 1)).rejects.toThrow(ForbiddenException);
  });
});
