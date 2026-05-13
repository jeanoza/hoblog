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
import { TagEntity } from '../domain/tag.entity';

@Injectable()
export class AddTagToActivityUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: IActivityRepository
  ) {}

  async execute(
    activityId: number,
    userId: number,
    name: string
  ): Promise<TagEntity> {
    const activity = await this.activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    if (activity.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const tag =
      (await this.tagRepository.findByName(name)) ??
      (await this.tagRepository.create(name));

    try {
      await this.tagRepository.link(activityId, tag.id);
    } catch {
      // already linked — idempotent
    }

    return tag;
  }
}
