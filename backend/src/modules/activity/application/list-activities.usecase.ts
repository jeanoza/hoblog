import { Injectable, Inject } from '@nestjs/common';
import { ACTIVITY_REPOSITORY, IActivityRepository } from '../domain/activity.repository.interface';
import { ActivityEntity } from '../domain/activity.entity';

@Injectable()
export class ListActivitiesUseCase {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: IActivityRepository
  ) {}

  execute(userId: number): Promise<ActivityEntity[]> {
    return this.activityRepository.findAllByUserId(userId);
  }
}
