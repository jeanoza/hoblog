import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ActivityModule } from '../activity/activity.module';
import { TagRepository } from './infrastructure/tag.repository';
import { TAG_REPOSITORY } from './domain/tag.repository.interface';
import { SearchTagsUseCase } from './application/search-tags.usecase';
import { GetActivityTagsUseCase } from './application/get-activity-tags.usecase';
import { AddTagToActivityUseCase } from './application/add-tag-to-activity.usecase';
import { RemoveTagFromActivityUseCase } from './application/remove-tag-from-activity.usecase';
import { DeleteTagUseCase } from './application/delete-tag.usecase';
import { TagController } from './presentation/tag.controller';
import { ActivityTagController } from './presentation/activity-tag.controller';

@Module({
  imports: [PrismaModule, ActivityModule],
  controllers: [TagController, ActivityTagController],
  providers: [
    { provide: TAG_REPOSITORY, useClass: TagRepository },
    SearchTagsUseCase,
    GetActivityTagsUseCase,
    AddTagToActivityUseCase,
    RemoveTagFromActivityUseCase,
    DeleteTagUseCase,
  ],
})
export class TagModule {}
