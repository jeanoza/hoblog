import { Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../user/domain/user.repository.interface';
import { USER_REPOSITORY } from '../../user/domain/user.repository.interface';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}

  async execute(userId: number): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, null);
  }
}
