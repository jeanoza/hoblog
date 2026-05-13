import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TAG_REPOSITORY } from '../domain/tag.repository.interface';
import type { ITagRepository } from '../domain/tag.repository.interface';
import { ACTIVITY_REPOSITORY } from '../../activity/domain/activity.repository.interface';
import type { IActivityRepository } from '../../activity/domain/activity.repository.interface';

@Injectable()
export class RemoveTagFromActivityUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: IActivityRepository
  ) {}

  async execute(
    activityId: number,
    tagId: number,
    userId: number
  ): Promise<void> {
    const activity = await this.activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    if (activity.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.tagRepository.unlink(activityId, tagId);
  }
}
