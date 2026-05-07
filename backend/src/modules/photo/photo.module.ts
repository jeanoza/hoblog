import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ActivityModule } from '../activity/activity.module';
import { PhotoRepository } from './infrastructure/photo.repository';
import { PHOTO_REPOSITORY } from './domain/photo.repository.interface';
import { GetUploadUrlUseCase } from './application/get-upload-url.usecase';
import { CreatePhotoUseCase } from './application/create-photo.usecase';
import { ListPhotosUseCase } from './application/list-photos.usecase';
import { DeletePhotoUseCase } from './application/delete-photo.usecase';
import { PhotoController } from './presentation/photo.controller';

@Module({
  imports: [PrismaModule, ActivityModule],
  controllers: [PhotoController],
  providers: [
    { provide: PHOTO_REPOSITORY, useClass: PhotoRepository },
    GetUploadUrlUseCase,
    CreatePhotoUseCase,
    ListPhotosUseCase,
    DeletePhotoUseCase,
  ],
})
export class PhotoModule {}
