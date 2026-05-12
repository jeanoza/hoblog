import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { IPhotoRepository } from '../domain/photo.repository.interface';
import { PhotoEntity } from '../domain/photo.entity';

@Injectable()
export class PhotoRepository implements IPhotoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<PhotoEntity | null> {
    const photo = await this.prisma.photo.findUnique({ where: { id } });
    return photo ? new PhotoEntity(photo) : null;
  }

  async findAllByActivityId(activityId: number): Promise<PhotoEntity[]> {
    const photos = await this.prisma.photo.findMany({
      where: { activityId },
      orderBy: { order: 'asc' },
    });
    return photos.map((p) => new PhotoEntity(p));
  }

  async create(data: {
    url: string;
    order: number;
    activityId: number;
  }): Promise<PhotoEntity> {
    const photo = await this.prisma.photo.create({ data });
    return new PhotoEntity(photo);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.photo.delete({ where: { id } });
  }
}
