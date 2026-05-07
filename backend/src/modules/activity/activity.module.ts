import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ActivityRepository } from './infrastructure/activity.repository';
import { ACTIVITY_REPOSITORY } from './domain/activity.repository.interface';
import { CreateActivityUseCase } from './application/create-activity.usecase';
import { ListActivitiesUseCase } from './application/list-activities.usecase';
import { GetActivityUseCase } from './application/get-activity.usecase';
import { UpdateActivityUseCase } from './application/update-activity.usecase';
import { DeleteActivityUseCase } from './application/delete-activity.usecase';
import { ActivityController } from './presentation/activity.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityController],
  providers: [
    { provide: ACTIVITY_REPOSITORY, useClass: ActivityRepository },
    CreateActivityUseCase,
    ListActivitiesUseCase,
    GetActivityUseCase,
    UpdateActivityUseCase,
    DeleteActivityUseCase,
  ],
})
export class ActivityModule {}
