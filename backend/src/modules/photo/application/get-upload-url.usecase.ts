import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { StorageService } from '../../../common/storage/storage.service';
import { ACTIVITY_REPOSITORY } from '../../activity/domain/activity.repository.interface';
import type { IActivityRepository } from '../../activity/domain/activity.repository.interface';

interface GetUploadUrlInput {
  userId: number;
  activityId: number;
  contentType: string;
}

export interface UploadUrlResult {
  uploadUrl: string;
  destination: string;
  publicUrl: string;
}

@Injectable()
export class GetUploadUrlUseCase {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: IActivityRepository,
    private readonly storageService: StorageService
  ) {}

  async execute(input: GetUploadUrlInput): Promise<UploadUrlResult> {
    const activity = await this.activityRepository.findById(input.activityId);
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    if (activity.userId !== input.userId) {
      throw new ForbiddenException('You do not own this activity');
    }

    const ext = input.contentType.split('/')[1] ?? 'jpg';
    const destination = `photos/${input.userId}/${input.activityId}/${Date.now()}.${ext}`;

    const uploadUrl = await this.storageService.getSignedUploadUrl(
      destination,
      input.contentType
    );
    const publicUrl = this.storageService.getPublicUrl(destination);

    return { uploadUrl, destination, publicUrl };
  }
}
