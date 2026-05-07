import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateCategoryUseCase } from './create-category.usecase';
import { DeleteCategoryUseCase } from './delete-category.usecase';
import type { ICategoryRepository } from '../domain/category.repository.interface';
import { CategoryEntity } from '../domain/category.entity';

const mockRepo: jest.Mocked<ICategoryRepository> = {
  findAllByUserId: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

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
    expect(mockRepo.create).toHaveBeenCalledWith({ name: 'Running', userId: 1 });
  });

  it('throws ConflictException on duplicate name', async () => {
    mockRepo.create.mockRejectedValue(new Error('Unique constraint'));

    await expect(useCase.execute(1, 'Running')).rejects.toThrow(ConflictException);
  });
});

describe('DeleteCategoryUseCase', () => {
  let useCase: DeleteCategoryUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteCategoryUseCase(mockRepo);
  });

  it('deletes the category when user owns it', async () => {
    const entity = new CategoryEntity({ id: 1, name: 'Running', userId: 1 });
    mockRepo.findById.mockResolvedValue(entity);
    mockRepo.delete.mockResolvedValue();

    await expect(useCase.execute(1, 1)).resolves.toBeUndefined();
    expect(mockRepo.delete).toHaveBeenCalledWith(1);
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
