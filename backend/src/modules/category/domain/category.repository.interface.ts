import { CategoryEntity } from './category.entity';

export interface ICategoryRepository {
  findAllByUserId(userId: number): Promise<CategoryEntity[]>;
  findById(id: number): Promise<CategoryEntity | null>;
  create(data: { name: string; userId: number }): Promise<CategoryEntity>;
  delete(id: number): Promise<void>;
}

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');
