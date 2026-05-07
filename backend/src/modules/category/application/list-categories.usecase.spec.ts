import { ListCategoriesUseCase } from './list-categories.usecase';
import type { ICategoryRepository } from '../domain/category.repository.interface';
import { CategoryEntity } from '../domain/category.entity';

const mockRepo: jest.Mocked<ICategoryRepository> = {
  findAllByUserId: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
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
