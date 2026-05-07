import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../domain/category.repository.interface';
import type { ICategoryRepository } from '../domain/category.repository.interface';
import { CategoryEntity } from '../domain/category.entity';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(userId: number, name: string): Promise<CategoryEntity> {
    try {
      return await this.categoryRepository.create({ name, userId });
    } catch {
      throw new ConflictException(`Category "${name}" already exists`);
    }
  }
}
