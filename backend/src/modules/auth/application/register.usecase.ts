import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { IUserRepository } from '../../user/domain/user.repository.interface';
import { USER_REPOSITORY } from '../../user/domain/user.repository.interface';

interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: RegisterInput): Promise<{ accessToken: string }> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.userRepository.create({
      email: input.email,
      name: input.name,
      passwordHash,
    });

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
    return { accessToken };
  }
}
