import { PhotoEntity } from './photo.entity';

export interface IPhotoRepository {
  findById(id: number): Promise<PhotoEntity | null>;
  findAllByActivityId(activityId: number): Promise<PhotoEntity[]>;
  create(data: { url: string; order: number; activityId: number }): Promise<PhotoEntity>;
  delete(id: number): Promise<void>;
}

export const PHOTO_REPOSITORY = Symbol('PHOTO_REPOSITORY');
