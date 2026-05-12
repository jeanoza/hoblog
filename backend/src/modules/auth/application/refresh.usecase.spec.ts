import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RefreshUseCase } from './refresh.usecase';
import { LoginUseCase } from './login.usecase';
import type { IUserRepository } from '../../user/domain/user.repository.interface';
import { UserEntity } from '../../user/domain/user.entity';

const mockUserRepository: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateRefreshToken: jest.fn(),
  update: jest.fn(),
};

const mockJwtService = {
  verify: jest.fn(),
} as unknown as JwtService;

const mockLoginUseCase = {
  issueTokens: jest.fn(),
} as unknown as LoginUseCase;

const REFRESH_TOKEN = 'mock.refresh.token';

const makeUser = (
  overrides: Partial<ConstructorParameters<typeof UserEntity>[0]> = {}
) =>
  new UserEntity({
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hash',
    createdAt: new Date(),
    ...overrides,
  });

describe('RefreshUseCase', () => {
  let useCase: RefreshUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RefreshUseCase(
      mockUserRepository,
      mockJwtService,
      mockLoginUseCase
    );
  });

  it('returns new tokens when refresh token is valid', async () => {
    const hash = await bcrypt.hash(REFRESH_TOKEN, 10);
    const user = makeUser({ refreshTokenHash: hash });

    (mockJwtService.verify as jest.Mock).mockReturnValue({
      sub: 1,
      email: user.email,
    });
    mockUserRepository.findById.mockResolvedValue(user);
    (mockLoginUseCase.issueTokens as jest.Mock).mockResolvedValue({
      accessToken: 'new.access.token',
      refreshToken: 'new.refresh.token',
    });

    const result = await useCase.execute({ refreshToken: REFRESH_TOKEN });

    expect(result).toEqual({
      accessToken: 'new.access.token',
      refreshToken: 'new.refresh.token',
    });
    expect(mockLoginUseCase.issueTokens).toHaveBeenCalledWith(1, user.email);
  });

  it('throws UnauthorizedException when JWT verification fails', async () => {
    (mockJwtService.verify as jest.Mock).mockImplementation(() => {
      throw new Error('jwt expired');
    });

    await expect(
      useCase.execute({ refreshToken: 'invalid.token' })
    ).rejects.toThrow(UnauthorizedException);
    expect(mockUserRepository.findById).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when user does not exist', async () => {
    (mockJwtService.verify as jest.Mock).mockReturnValue({
      sub: 99,
      email: 'ghost@example.com',
    });
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ refreshToken: REFRESH_TOKEN })
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when user has no stored refresh token', async () => {
    (mockJwtService.verify as jest.Mock).mockReturnValue({
      sub: 1,
      email: 'test@example.com',
    });
    mockUserRepository.findById.mockResolvedValue(
      makeUser({ refreshTokenHash: null })
    );

    await expect(
      useCase.execute({ refreshToken: REFRESH_TOKEN })
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when refresh token hash does not match', async () => {
    (mockJwtService.verify as jest.Mock).mockReturnValue({
      sub: 1,
      email: 'test@example.com',
    });
    const user = makeUser({
      refreshTokenHash: await bcrypt.hash('different.token', 10),
    });
    mockUserRepository.findById.mockResolvedValue(user);

    await expect(
      useCase.execute({ refreshToken: REFRESH_TOKEN })
    ).rejects.toThrow(UnauthorizedException);
  });
});
