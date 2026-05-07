import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ACTIVITY_REPOSITORY } from '../../activity/domain/activity.repository.interface';
import type { IActivityRepository } from '../../activity/domain/activity.repository.interface';
import { PHOTO_REPOSITORY } from '../domain/photo.repository.interface';
import type { IPhotoRepository } from '../domain/photo.repository.interface';
import { PhotoEntity } from '../domain/photo.entity';

interface CreatePhotoInput {
  userId: number;
  activityId: number;
  url: string;
  order?: number;
}

@Injectable()
export class CreatePhotoUseCase {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: IActivityRepository,
    @Inject(PHOTO_REPOSITORY)
    private readonly photoRepository: IPhotoRepository
  ) {}

  async execute(input: CreatePhotoInput): Promise<PhotoEntity> {
    const activity = await this.activityRepository.findById(input.activityId);
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    if (activity.userId !== input.userId) {
      throw new ForbiddenException('You do not own this activity');
    }

    return this.photoRepository.create({
      url: input.url,
      order: input.order ?? 0,
      activityId: input.activityId,
    });
  }
}
