import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../domain/category.repository.interface';
import type { ICategoryRepository } from '../domain/category.repository.interface';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(userId: number, categoryId: number): Promise<void> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (category.userId !== userId) {
      throw new ForbiddenException('You do not own this category');
    }
    const activeCount =
      await this.categoryRepository.countActiveActivities(categoryId);
    if (activeCount > 0) {
      throw new ConflictException('Category is in use by activities');
    }
    await this.categoryRepository.delete(categoryId);
  }
}
