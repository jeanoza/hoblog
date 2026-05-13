import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  type AuthUser,
} from '../../../common/decorators/current-user.decorator';
import { GetActivityTagsUseCase } from '../application/get-activity-tags.usecase';
import { AddTagToActivityUseCase } from '../application/add-tag-to-activity.usecase';
import { RemoveTagFromActivityUseCase } from '../application/remove-tag-from-activity.usecase';
import { AddTagDto } from './dto/add-tag.dto';

@Controller('activities/:activityId/tags')
@UseGuards(JwtAuthGuard)
export class ActivityTagController {
  constructor(
    private readonly getActivityTagsUseCase: GetActivityTagsUseCase,
    private readonly addTagToActivityUseCase: AddTagToActivityUseCase,
    private readonly removeTagFromActivityUseCase: RemoveTagFromActivityUseCase
  ) {}

  @Get()
  list(
    @Param('activityId', ParseIntPipe) activityId: number,
    @CurrentUser() user: AuthUser
  ) {
    return this.getActivityTagsUseCase.execute(activityId, user.userId);
  }

  @Post()
  add(
    @Param('activityId', ParseIntPipe) activityId: number,
    @Body() dto: AddTagDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.addTagToActivityUseCase.execute(
      activityId,
      user.userId,
      dto.name
    );
  }

  @Delete(':tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('activityId', ParseIntPipe) activityId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
    @CurrentUser() user: AuthUser
  ) {
    return this.removeTagFromActivityUseCase.execute(
      activityId,
      tagId,
      user.userId
    );
  }
}
