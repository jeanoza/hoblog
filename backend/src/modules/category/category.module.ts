import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { CategoryRepository } from './infrastructure/category.repository';
import { CATEGORY_REPOSITORY } from './domain/category.repository.interface';
import { ListCategoriesUseCase } from './application/list-categories.usecase';
import { CreateCategoryUseCase } from './application/create-category.usecase';
import { DeleteCategoryUseCase } from './application/delete-category.usecase';
import { CategoryController } from './presentation/category.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryController],
  providers: [
    { provide: CATEGORY_REPOSITORY, useClass: CategoryRepository },
    ListCategoriesUseCase,
    CreateCategoryUseCase,
    DeleteCategoryUseCase,
  ],
})
export class CategoryModule {}
