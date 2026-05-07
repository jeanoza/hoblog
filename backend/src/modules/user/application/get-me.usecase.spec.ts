import { NotFoundException } from '@nestjs/common';
import { GetMeUseCase } from './get-me.usecase';
import type { IUserRepository } from '../domain/user.repository.interface';
import { UserEntity } from '../domain/user.entity';

const mockUserRepository: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateRefreshToken: jest.fn(),
  update: jest.fn(),
};

const mockUser = new UserEntity({
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: 'hashed',
  createdAt: new Date('2024-01-01'),
});

describe('GetMeUseCase', () => {
  let useCase: GetMeUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetMeUseCase(mockUserRepository);
  });

  it('returns the user profile for a valid userId', async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);

    const result = await useCase.execute(1);

    expect(result).toEqual({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      createdAt: mockUser.createdAt,
    });
  });

  it('does not expose passwordHash or refreshTokenHash', async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);

    const result = await useCase.execute(1);

    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('refreshTokenHash');
  });

  it('throws NotFoundException when user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
  });
});
