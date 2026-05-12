import { UpdateMeUseCase } from './update-me.usecase';
import type { IUserRepository } from '../domain/user.repository.interface';
import { UserEntity } from '../domain/user.entity';

const mockUserRepository: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateRefreshToken: jest.fn(),
  update: jest.fn(),
};

describe('UpdateMeUseCase', () => {
  let useCase: UpdateMeUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateMeUseCase(mockUserRepository);
  });

  it('updates the user name and returns the profile', async () => {
    const updatedUser = new UserEntity({
      id: 1,
      email: 'test@example.com',
      name: 'New Name',
      passwordHash: 'hashed',
      createdAt: new Date('2024-01-01'),
    });
    mockUserRepository.update.mockResolvedValue(updatedUser);

    const result = await useCase.execute(1, { name: 'New Name' });

    expect(result.name).toBe('New Name');
    expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
      name: 'New Name',
    });
  });

  it('does not expose sensitive fields', async () => {
    const updatedUser = new UserEntity({
      id: 1,
      email: 'test@example.com',
      name: 'New Name',
      passwordHash: 'hashed',
      createdAt: new Date('2024-01-01'),
    });
    mockUserRepository.update.mockResolvedValue(updatedUser);

    const result = await useCase.execute(1, { name: 'New Name' });

    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('refreshTokenHash');
  });
});
