import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TAG_REPOSITORY } from '../domain/tag.repository.interface';
import type { ITagRepository } from '../domain/tag.repository.interface';

@Injectable()
export class DeleteTagUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository
  ) {}

  async execute(tagId: number): Promise<void> {
    const tag = await this.tagRepository.findById(tagId);
    if (!tag) throw new NotFoundException('Tag not found');

    await this.tagRepository.delete(tagId);
  }
}
