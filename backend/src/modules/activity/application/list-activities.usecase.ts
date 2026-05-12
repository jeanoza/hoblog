import { Injectable, Inject } from '@nestjs/common';
import { ACTIVITY_REPOSITORY } from '../domain/activity.repository.interface';
import type {
  IActivityRepository,
  ActivitySort,
} from '../domain/activity.repository.interface';
import { ActivityEntity } from '../domain/activity.entity';

@Injectable()
export class ListActivitiesUseCase {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: IActivityRepository
  ) {}

  execute(
    userId: number,
    options?: {
      skip?: number;
      take?: number;
      categoryId?: number;
      sort?: ActivitySort;
    }
  ): Promise<ActivityEntity[]> {
    return this.activityRepository.findAllByUserId(userId, options);
  }
}
