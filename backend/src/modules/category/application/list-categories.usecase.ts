import { Injectable, Inject } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../domain/category.repository.interface';
import type { ICategoryRepository } from '../domain/category.repository.interface';
import { CategoryEntity } from '../domain/category.entity';

@Injectable()
export class ListCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository
  ) {}

  execute(userId: number): Promise<CategoryEntity[]> {
    return this.categoryRepository.findAllByUserId(userId);
  }
}
