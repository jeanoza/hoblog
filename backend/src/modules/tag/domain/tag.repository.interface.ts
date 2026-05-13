import { TagEntity } from './tag.entity';

export interface ITagRepository {
  findById(id: number): Promise<TagEntity | null>;
  findByName(name: string): Promise<TagEntity | null>;
  searchByName(query: string, limit?: number): Promise<string[]>;
  create(name: string): Promise<TagEntity>;
  delete(id: number): Promise<void>;
  findByActivityId(activityId: number): Promise<TagEntity[]>;
  link(activityId: number, tagId: number): Promise<void>;
  unlink(activityId: number, tagId: number): Promise<void>;
}

export const TAG_REPOSITORY = Symbol('TAG_REPOSITORY');
