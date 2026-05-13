import { Injectable, Inject } from '@nestjs/common';
import { TAG_REPOSITORY } from '../domain/tag.repository.interface';
import type { ITagRepository } from '../domain/tag.repository.interface';

@Injectable()
export class SearchTagsUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository
  ) {}

  execute(query: string, limit = 10): Promise<string[]> {
    return this.tagRepository.searchByName(query, limit);
  }
}
