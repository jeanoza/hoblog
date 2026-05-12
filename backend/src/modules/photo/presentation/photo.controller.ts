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
import { GetUploadUrlUseCase } from '../application/get-upload-url.usecase';
import { CreatePhotoUseCase } from '../application/create-photo.usecase';
import { ListPhotosUseCase } from '../application/list-photos.usecase';
import { DeletePhotoUseCase } from '../application/delete-photo.usecase';
import { GetUploadUrlDto } from './dto/get-upload-url.dto';
import { CreatePhotoDto } from './dto/create-photo.dto';

@Controller('activities/:activityId/photos')
@UseGuards(JwtAuthGuard)
export class PhotoController {
  constructor(
    private readonly getUploadUrlUseCase: GetUploadUrlUseCase,
    private readonly createPhotoUseCase: CreatePhotoUseCase,
    private readonly listPhotosUseCase: ListPhotosUseCase,
    private readonly deletePhotoUseCase: DeletePhotoUseCase
  ) {}

  @Post('upload-url')
  getUploadUrl(
    @CurrentUser() user: AuthUser,
    @Param('activityId', ParseIntPipe) activityId: number,
    @Body() dto: GetUploadUrlDto
  ) {
    return this.getUploadUrlUseCase.execute({
      userId: user.userId,
      activityId,
      contentType: dto.contentType,
    });
  }

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Param('activityId', ParseIntPipe) activityId: number
  ) {
    return this.listPhotosUseCase.execute(user.userId, activityId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('activityId', ParseIntPipe) activityId: number,
    @Body() dto: CreatePhotoDto
  ) {
    return this.createPhotoUseCase.execute({
      userId: user.userId,
      activityId,
      url: dto.url,
      order: dto.order,
    });
  }

  @Delete(':photoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @CurrentUser() user: AuthUser,
    @Param('photoId', ParseIntPipe) photoId: number
  ) {
    return this.deletePhotoUseCase.execute(user.userId, photoId);
  }
}
