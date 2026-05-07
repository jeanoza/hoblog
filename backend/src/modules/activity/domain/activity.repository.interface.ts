import { ActivityEntity } from './activity.entity';

export interface IActivityRepository {
  findById(id: number): Promise<ActivityEntity | null>;
  findAllByUserId(userId: number): Promise<ActivityEntity[]>;
  create(data: {
    title: string;
    note?: string | null;
    date: Date;
    userId: number;
    categoryId: number;
  }): Promise<ActivityEntity>;
  update(
    id: number,
    data: {
      title?: string;
      note?: string | null;
      date?: Date;
      categoryId?: number;
    }
  ): Promise<ActivityEntity>;
  delete(id: number): Promise<void>;
}

export const ACTIVITY_REPOSITORY = Symbol('ACTIVITY_REPOSITORY');
