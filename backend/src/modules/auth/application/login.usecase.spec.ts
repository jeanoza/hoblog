import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUseCase } from './login.usecase';
import type { IUserRepository } from '../../user/domain/user.repository.interface';
import { UserEntity } from '../../user/domain/user.entity';

const mockUserRepository: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.access.token'),
} as unknown as JwtService;

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let hashedPassword: string;

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash('correct-password', 10);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginUseCase(mockUserRepository, mockJwtService);
  });

  it('should return an access token for valid credentials', async () => {
    const user = new UserEntity(
      1,
      'test@example.com',
      'Test User',
      hashedPassword,
      new Date(),
    );
    mockUserRepository.findByEmail.mockResolvedValue(user);

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'correct-password',
    });

    expect(result).toEqual({ accessToken: 'mock.access.token' });
    expect(mockJwtService.sign).toHaveBeenCalledWith({
      sub: 1,
      email: 'test@example.com',
    });
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'unknown@example.com',
        password: 'any-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if password is incorrect', async () => {
    const user = new UserEntity(
      1,
      'test@example.com',
      'Test User',
      hashedPassword,
      new Date(),
    );
    mockUserRepository.findByEmail.mockResolvedValue(user);

    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
