import { Injectable, Inject } from '@nestjs/common';
import { ACTIVITY_REPOSITORY } from '../domain/activity.repository.interface';
import type { IActivityRepository } from '../domain/activity.repository.interface';
import { ActivityEntity } from '../domain/activity.entity';

interface CreateActivityInput {
  title: string;
  note?: string | null;
  date: Date;
  categoryId: number;
  userId: number;
}

@Injectable()
export class CreateActivityUseCase {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: IActivityRepository
  ) {}

  execute(input: CreateActivityInput): Promise<ActivityEntity> {
    return this.activityRepository.create(input);
  }
}
