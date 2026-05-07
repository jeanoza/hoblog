import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '../domain/user.repository.interface';
import { USER_REPOSITORY } from '../domain/user.repository.interface';
import { UserEntity } from '../domain/user.entity';

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
}

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}

  async execute(userId: number): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toProfile(user);
  }

  private toProfile(user: UserEntity): UserProfile {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}
