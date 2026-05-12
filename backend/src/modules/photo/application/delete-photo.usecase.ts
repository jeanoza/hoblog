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

@Injectable()
export class DeletePhotoUseCase {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: IActivityRepository,
    @Inject(PHOTO_REPOSITORY)
    private readonly photoRepository: IPhotoRepository,
    private readonly storageService: StorageService
  ) {}

  async execute(userId: number, photoId: number): Promise<void> {
    const photo = await this.photoRepository.findById(photoId);
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    const activity = await this.activityRepository.findById(photo.activityId);
    if (!activity || activity.userId !== userId) {
      throw new ForbiddenException('You do not own this photo');
    }

    const destination = this.extractDestination(photo.url);
    if (destination) {
      await this.storageService.deleteFile(destination);
    }
    await this.photoRepository.delete(photoId);
  }

  private extractDestination(url: string): string | null {
    // https://storage.googleapis.com/<bucket>/<destination>
    const match = /storage\.googleapis\.com\/[^/]+\/(.+)/.exec(url);
    return match?.[1] ?? null;
  }
}
