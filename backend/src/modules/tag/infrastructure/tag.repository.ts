import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { ITagRepository } from '../domain/tag.repository.interface';
import { TagEntity } from '../domain/tag.entity';

@Injectable()
export class TagRepository implements ITagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<TagEntity | null> {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    return tag ? new TagEntity(tag) : null;
  }

  async findByName(name: string): Promise<TagEntity | null> {
    const tag = await this.prisma.tag.findUnique({ where: { name } });
    return tag ? new TagEntity(tag) : null;
  }

  async searchByName(query: string, limit = 10): Promise<string[]> {
    const tags = await this.prisma.tag.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      select: { name: true },
      orderBy: { name: 'asc' },
      take: limit,
    });
    return tags.map((t) => t.name);
  }

  async create(name: string): Promise<TagEntity> {
    const tag = await this.prisma.tag.create({ data: { name } });
    return new TagEntity(tag);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.tag.delete({ where: { id } });
  }

  async findByActivityId(activityId: number): Promise<TagEntity[]> {
    const activityTags = await this.prisma.activityTag.findMany({
      where: { activityId },
      include: { tag: true },
    });
    return activityTags.map((at) => new TagEntity(at.tag));
  }

  async link(activityId: number, tagId: number): Promise<void> {
    await this.prisma.activityTag.create({ data: { activityId, tagId } });
  }

  async unlink(activityId: number, tagId: number): Promise<void> {
    await this.prisma.activityTag.delete({
      where: { activityId_tagId: { activityId, tagId } },
    });
  }
}
