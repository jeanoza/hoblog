import { Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from '../domain/user.repository.interface';
import { USER_REPOSITORY } from '../domain/user.repository.interface';
import { UserProfile } from './get-me.usecase';

@Injectable()
export class UpdateMeUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}

  async execute(userId: number, data: { name?: string }): Promise<UserProfile> {
    const user = await this.userRepository.update(userId, data);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}
