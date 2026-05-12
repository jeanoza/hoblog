import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ACTIVITY_REPOSITORY } from '../../activity/domain/activity.repository.interface';
import type { IActivityRepository } from '../../activity/domain/activity.repository.interface';
import { PHOTO_REPOSITORY } from '../domain/photo.repository.interface';
import type { IPhotoRepository } from '../domain/photo.repository.interface';
import { StorageService } from '../../../common/storage/storage.service';

export interface PhotoWithSignedUrl {
  id: number;
  order: number;
  activityId: number;
  signedUrl: string;
}

function extractDestination(url: string): string | null {
  const match = /storage\.googleapis\.com\/[^/]+\/(.+)/.exec(url);
  return match?.[1] ?? null;
}

@Injectable()
export class ListPhotosUseCase {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: IActivityRepository,
    @Inject(PHOTO_REPOSITORY)
    private readonly photoRepository: IPhotoRepository,
    private readonly storageService: StorageService
  ) {}

  async execute(
    userId: number,
    activityId: number
  ): Promise<PhotoWithSignedUrl[]> {
    const activity = await this.activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    if (activity.userId !== userId) {
      throw new ForbiddenException('You do not own this activity');
    }

    const photos = await this.photoRepository.findAllByActivityId(activityId);

    return Promise.all(
      photos.map(async (photo) => {
        const destination = extractDestination(photo.url);
        const signedUrl = destination
          ? await this.storageService.getSignedReadUrl(destination)
          : photo.url;

        return {
          id: photo.id,
          order: photo.order,
          activityId: photo.activityId,
          signedUrl,
        };
      })
    );
  }
}
