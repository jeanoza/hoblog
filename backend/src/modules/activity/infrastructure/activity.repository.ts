import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { IActivityRepository } from '../domain/activity.repository.interface';
import type { ActivitySort } from '../domain/activity.repository.interface';
import { ActivityEntity } from '../domain/activity.entity';

@Injectable()
export class ActivityRepository implements IActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<ActivityEntity | null> {
    const activity = await this.prisma.activity.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!activity) return null;
    return new ActivityEntity({ ...activity, userName: activity.user.name });
  }

  async findAllByUserId(
    userId: number,
    options?: {
      skip?: number;
      take?: number;
      categoryId?: number;
      sort?: ActivitySort;
    }
  ): Promise<ActivityEntity[]> {
    const { field = 'updatedAt', order = 'desc' } = options?.sort ?? {};
    const activities = await this.prisma.activity.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(options?.categoryId ? { categoryId: options.categoryId } : {}),
      },
      include: { user: { select: { name: true } } },
      orderBy: { [field]: order },
      skip: options?.skip,
      take: options?.take,
    });
    // prettier-ignore
    return activities.map((a) => new ActivityEntity({ ...a, userName: a.user.name }));
  }

  async create(data: {
    title: string;
    note?: string | null;
    date: Date;
    userId: number;
    categoryId: number;
  }): Promise<ActivityEntity> {
    const activity = await this.prisma.activity.create({
      data,
      include: { user: { select: { name: true } } },
    });
    return new ActivityEntity({ ...activity, userName: activity.user.name });
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
    const activity = await this.prisma.activity.update({
      where: { id },
      data,
      include: { user: { select: { name: true } } },
    });
    return new ActivityEntity({ ...activity, userName: activity.user.name });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.activity.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
