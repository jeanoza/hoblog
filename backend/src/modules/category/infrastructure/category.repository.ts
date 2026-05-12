import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { ICategoryRepository } from '../domain/category.repository.interface';
import { CategoryEntity } from '../domain/category.entity';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUserId(userId: number): Promise<CategoryEntity[]> {
    const categories = await this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    return categories.map((c) => new CategoryEntity(c));
  }

  async findById(id: number): Promise<CategoryEntity | null> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    return category ? new CategoryEntity(category) : null;
  }

  async create(data: {
    name: string;
    userId: number;
  }): Promise<CategoryEntity> {
    const category = await this.prisma.category.create({ data });
    return new CategoryEntity(category);
  }

  async update(id: number, name: string): Promise<CategoryEntity> {
    const category = await this.prisma.category.update({
      where: { id },
      data: { name },
    });
    return new CategoryEntity(category);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }
}
