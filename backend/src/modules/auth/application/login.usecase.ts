import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { IUserRepository } from '../../user/domain/user.repository.interface';
import { USER_REPOSITORY } from '../../user/domain/user.repository.interface';

interface LoginInput {
  email: string;
  password: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LoginInput): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
    return { accessToken };
  }
}
