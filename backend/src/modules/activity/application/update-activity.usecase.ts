import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ACTIVITY_REPOSITORY } from '../domain/activity.repository.interface';
import type { IActivityRepository } from '../domain/activity.repository.interface';
import { ActivityEntity } from '../domain/activity.entity';

interface UpdateActivityInput {
  title?: string;
  note?: string | null;
  date?: Date;
  categoryId?: number;
}

@Injectable()
export class UpdateActivityUseCase {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: IActivityRepository
  ) {}

  async execute(id: number, userId: number, input: UpdateActivityInput): Promise<ActivityEntity> {
    const activity = await this.activityRepository.findById(id);
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    if (activity.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return this.activityRepository.update(id, input);
  }
}
