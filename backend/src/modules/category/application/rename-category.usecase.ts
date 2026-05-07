import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../domain/category.repository.interface';
import type { ICategoryRepository } from '../domain/category.repository.interface';
import { CategoryEntity } from '../domain/category.entity';

@Injectable()
export class RenameCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(userId: number, categoryId: number, name: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (category.userId !== userId) {
      throw new ForbiddenException('You do not own this category');
    }

    try {
      return await this.categoryRepository.update(categoryId, name);
    } catch {
      throw new ConflictException(`Category "${name}" already exists`);
    }
  }
}
