import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { IUserRepository } from '../domain/user.repository.interface';
import { UserEntity } from '../domain/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return new UserEntity(user.id, user.email, user.name, user.passwordHash, user.createdAt);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return new UserEntity(user.id, user.email, user.name, user.passwordHash, user.createdAt);
  }

  async create(data: { email: string; name: string; passwordHash: string }): Promise<UserEntity> {
    const user = await this.prisma.user.create({ data });
    return new UserEntity(user.id, user.email, user.name, user.passwordHash, user.createdAt);
  }
}
