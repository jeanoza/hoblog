import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { IActivityRepository } from '../domain/activity.repository.interface';
import { ActivityEntity } from '../domain/activity.entity';

@Injectable()
export class ActivityRepository implements IActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<ActivityEntity | null> {
    const activity = await this.prisma.activity.findUnique({ where: { id } });
    if (!activity) return null;
    return new ActivityEntity(activity);
  }

  async findAllByUserId(
    userId: number,
    options?: { skip?: number; take?: number; categoryId?: number }
  ): Promise<ActivityEntity[]> {
    const activities = await this.prisma.activity.findMany({
      where: { userId, ...(options?.categoryId ? { categoryId: options.categoryId } : {}) },
      orderBy: { date: 'desc' },
      skip: options?.skip,
      take: options?.take,
    });
    return activities.map((a) => new ActivityEntity(a));
  }

  async create(data: {
    title: string;
    note?: string | null;
    date: Date;
    userId: number;
    categoryId: number;
  }): Promise<ActivityEntity> {
    const activity = await this.prisma.activity.create({ data });
    return new ActivityEntity(activity);
  }

  async update(
    id: number,
    data: {
      title?: string;
      note?: string | null;
      date?: Date;
      categoryId?: number;
    }
  ): Promise<ActivityEntity> {
    const activity = await this.prisma.activity.update({ where: { id }, data });
    return new ActivityEntity(activity);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.activity.delete({ where: { id } });
  }
}
