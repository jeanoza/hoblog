import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { IUserRepository } from '../../user/domain/user.repository.interface';
import { USER_REPOSITORY } from '../../user/domain/user.repository.interface';
import { LoginUseCase } from './login.usecase';

interface RefreshInput {
  refreshToken: string;
}

@Injectable()
export class RefreshUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly loginUseCase: LoginUseCase
  ) {}

  async execute(
    input: RefreshInput
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: { sub: number; email: string };

    try {
      payload = this.jwtService.verify<{ sub: number; email: string }>(
        input.refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET ?? 'changeme-refresh',
        }
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await bcrypt.compare(
      input.refreshToken,
      user.refreshTokenHash
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.loginUseCase.issueTokens(user.id, user.email);
  }
}
