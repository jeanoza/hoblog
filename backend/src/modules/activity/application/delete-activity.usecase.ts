import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ACTIVITY_REPOSITORY } from '../domain/activity.repository.interface';
import type { IActivityRepository } from '../domain/activity.repository.interface';

@Injectable()
export class DeleteActivityUseCase {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: IActivityRepository
  ) {}

  async execute(id: number, userId: number): Promise<void> {
    const activity = await this.activityRepository.findById(id);
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    if (activity.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    await this.activityRepository.delete(id);
  }
}
