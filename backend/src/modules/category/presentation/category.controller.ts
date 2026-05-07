import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../../../common/decorators/current-user.decorator';
import { ListCategoriesUseCase } from '../application/list-categories.usecase';
import { CreateCategoryUseCase } from '../application/create-category.usecase';
import { DeleteCategoryUseCase } from '../application/delete-category.usecase';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase
  ) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.listCategoriesUseCase.execute(user.userId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCategoryDto) {
    return this.createCategoryUseCase.execute(user.userId, dto.name);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.deleteCategoryUseCase.execute(user.userId, id);
  }
}
