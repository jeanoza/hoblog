import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../../common/decorators/current-user.decorator';
import { CreateActivityUseCase } from '../application/create-activity.usecase';
import { ListActivitiesUseCase } from '../application/list-activities.usecase';
import { GetActivityUseCase } from '../application/get-activity.usecase';
import { UpdateActivityUseCase } from '../application/update-activity.usecase';
import { DeleteActivityUseCase } from '../application/delete-activity.usecase';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

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
  list(@CurrentUser() user: AuthUser) {
    return this.listActivitiesUseCase.execute(user.userId);
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
