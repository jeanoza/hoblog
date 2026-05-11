import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../../../common/decorators/current-user.decorator';
import { CreateActivityUseCase } from '../application/create-activity.usecase';
import { ListActivitiesUseCase } from '../application/list-activities.usecase';
import { GetActivityUseCase } from '../application/get-activity.usecase';
import { UpdateActivityUseCase } from '../application/update-activity.usecase';
import { DeleteActivityUseCase } from '../application/delete-activity.usecase';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import type { ActivitySort, ActivitySortField } from '../domain/activity.repository.interface';

const ALLOWED_SORT_FIELDS = new Set<ActivitySortField>(['createdAt', 'updatedAt', 'date', 'title']);

function parseSort(raw?: string): ActivitySort | undefined {
  if (!raw) return undefined;
  const desc = raw.startsWith('-');
  const field = (desc ? raw.slice(1) : raw) as ActivitySortField;
  if (!ALLOWED_SORT_FIELDS.has(field)) return undefined;
  return { field, order: desc ? 'desc' : 'asc' };
}

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(
    private readonly createActivityUseCase: CreateActivityUseCase,
    private readonly listActivitiesUseCase: ListActivitiesUseCase,
    private readonly getActivityUseCase: GetActivityUseCase,
    private readonly updateActivityUseCase: UpdateActivityUseCase,
    private readonly deleteActivityUseCase: DeleteActivityUseCase
  ) {}

  @Post()
  create(@Body() dto: CreateActivityDto, @CurrentUser() user: AuthUser) {
    return this.createActivityUseCase.execute({
      ...dto,
      date: new Date(dto.date),
      userId: user.userId,
    });
  }

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('categoryId') categoryId?: string,
    @Query('sort') sort?: string
  ) {
    return this.listActivitiesUseCase.execute(user.userId, {
      skip: skip !== undefined ? parseInt(skip) : undefined,
      take: take !== undefined ? parseInt(take) : undefined,
      categoryId: categoryId !== undefined ? parseInt(categoryId) : undefined,
      sort: parseSort(sort),
    });
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.getActivityUseCase.execute(id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateActivityDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.updateActivityUseCase.execute(id, user.userId, {
      ...dto,
      date: dto.date ? new Date(dto.date) : undefined,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.deleteActivityUseCase.execute(id, user.userId);
  }
}
